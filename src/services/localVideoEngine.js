/**
 * CleanMark AI — High-Performance In-Browser Video Watermark Removal Engine
 * Uses WebCodecs (VideoEncoder) + mp4-muxer + mp4box + Canvas 2D unblending.
 * Runs 100% locally on the user's hardware with 0 server calls and 0MB network transfer.
 */
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import * as MP4Box from 'mp4box';
import { unblendCropImageData } from '../utils/alphaUnblend';

/**
 * Accurately extracts native video FPS directly from the file container
 */
export async function extractVideoMetadata(file) {
  if (!file) return null;
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (res) => {
      if (resolved) return;
      resolved = true;
      resolve(res);
    };

    // 2-second timeout fallback for non-MP4 or unusual containers
    const timeout = setTimeout(() => finish(null), 2000);

    try {
      const mp4boxfile = MP4Box.createFile();

      mp4boxfile.onReady = function (info) {
        clearTimeout(timeout);
        const videoTrack = (info.videoTracks && info.videoTracks.length > 0)
          ? info.videoTracks[0]
          : (info.tracks || []).find(t => t.video || (t.track_width && t.track_height));

        let fps = null;
        if (videoTrack && videoTrack.nb_samples && videoTrack.duration && videoTrack.timescale) {
          const calcFps = videoTrack.nb_samples / (videoTrack.duration / videoTrack.timescale);
          if (calcFps > 0 && calcFps <= 240) {
            fps = Math.round(calcFps * 100) / 100;
          }
        }

        finish({
          fps,
          videoTrack,
          duration: info.duration ? (info.duration / info.timescale) : null,
        });
      };

      mp4boxfile.onError = () => {
        clearTimeout(timeout);
        finish(null);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buf = e.target.result;
          buf.fileStart = 0;
          mp4boxfile.appendBuffer(buf);
          mp4boxfile.flush();
        } catch (err) {
          clearTimeout(timeout);
          finish(null);
        }
      };
      reader.onerror = () => {
        clearTimeout(timeout);
        finish(null);
      };

      // Read full file for smaller files, or first 8MB for large files
      const sliceSize = file.size < 25 * 1024 * 1024 ? file.size : 8 * 1024 * 1024;
      reader.readAsArrayBuffer(file.slice(0, sliceSize));
    } catch (e) {
      clearTimeout(timeout);
      finish(null);
    }
  });
}

/**
 * Applies mathematical alpha unblending to a specific region on a 2D canvas
 */
export function unblendCanvasRegion(ctx, canvasWidth, canvasHeight, box, star, gain = 0.28) {
  let sx, sy, sSize;

  if (star && star.size) {
    sx = Math.round(star.x);
    sy = Math.round(star.y);
    sSize = Math.round(star.size);
  } else if (box) {
    const bx = Math.round(box.x * canvasWidth);
    const by = Math.round(box.y * canvasHeight);
    const bw = Math.round(box.w * canvasWidth);
    const bh = Math.round(box.h * canvasHeight);
    sSize = Math.min(bw, bh);
    sx = bx + Math.round((bw - sSize) / 2);
    sy = by + Math.round((bh - sSize) / 2);
  } else {
    return;
  }

  // Boundary clamping
  sx = Math.max(0, Math.min(canvasWidth - 1, sx));
  sy = Math.max(0, Math.min(canvasHeight - 1, sy));
  if (sx + sSize > canvasWidth) sSize = canvasWidth - sx;
  if (sy + sSize > canvasHeight) sSize = canvasHeight - sy;
  if (sSize <= 4) return;

  const patch = ctx.getImageData(sx, sy, sSize, sSize);
  unblendCropImageData(patch, sSize, sSize, 0, 0, sSize, gain);
  ctx.putImageData(patch, sx, sy);
}

/**
 * High-speed, Jitter-Free In-Browser Video Processing Pipeline
 * Dynamic Native FPS (defaults to 24 FPS for Gemini/Veo), compositor-synchronized frame capture,
 * explicit microsecond frame durations, and MPEG-4 Part 14 compliant sample headers.
 */
export async function processVideoLocally({
  videoFile,
  box,
  star,
  gain = 0.28,
  startSec = 0,
  endSec = null,
  fps: requestedFps = null,
  onProgress = () => {},
  abortSignal = null
}) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  const videoUrl = URL.createObjectURL(videoFile);
  video.src = videoUrl;

  await new Promise((resolve, reject) => {
    if (video.readyState >= 2) {
      resolve();
    } else {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video data for local processing'));
    }
  });

  // Ensure dimensions are even numbers (strictly required by H.264 codecs)
  let width = video.videoWidth;
  let height = video.videoHeight;
  if (width % 2 !== 0) width -= 1;
  if (height % 2 !== 0) height -= 1;

  const duration = video.duration || 1;
  const actualStart = Math.max(0, startSec);
  const actualEnd = endSec && endSec > actualStart ? Math.min(duration, endSec) : duration;
  const targetDuration = actualEnd - actualStart;

  // Determine true native FPS: Google Gemini / Veo AI videos are natively 24.0 FPS
  let fps = 24;
  if (typeof requestedFps === 'number' && requestedFps > 0) {
    fps = Math.round(requestedFps);
  } else {
    try {
      const meta = await extractVideoMetadata(videoFile);
      if (meta && meta.fps) {
        fps = Math.round(meta.fps);
      }
    } catch (e) {
      console.warn('[LocalVideoEngine] FPS probe fallback to 24 (Gemini native):', e);
    }
  }
  fps = Math.max(12, Math.min(120, fps));

  const totalFrames = Math.max(1, Math.round(targetDuration * fps));
  const frameIntervalSec = 1.0 / fps;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const supportsWebCodecs = typeof window !== 'undefined' && 'VideoEncoder' in window;

  if (supportsWebCodecs) {
    // === PIPELINE A: WebCodecs Hardware H.264 Encoder + mp4-muxer ===
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: 'avc',
        width,
        height,
        rotation: 0,
      },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'strict'
    });

    let encoderError = null;
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => {
        console.error('[LocalVideoEngine] VideoEncoder error:', e);
        encoderError = e;
      }
    });

    const pixelCount = width * height;
    const targetBitrate = Math.min(24_000_000, Math.max(2_500_000, pixelCount * fps * 0.18));

    // Choose appropriate AVC Level based on resolution:
    // Level 3.1 (0x1f): up to 720p (921,600 pixels)
    // Level 4.2 (0x2a): up to 1080p Full HD (2,228,224 pixels)
    // Level 5.1 (0x33): up to 4K UHD (9,437,184 pixels, covers 3840x2160)
    let chosenCodec = 'avc1.4d002a';
    if (pixelCount > 2_228_224) {
      chosenCodec = 'avc1.4d0033'; // 4K UHD requires Level 5.1
    } else if (pixelCount <= 921_600) {
      chosenCodec = 'avc1.42001f'; // Baseline Level 3.1
    }

    if (typeof VideoEncoder.isConfigSupported === 'function') {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec: chosenCodec,
          width,
          height,
          bitrate: targetBitrate,
          framerate: fps
        });
        if (!support || !support.supported) {
          if (pixelCount > 2_228_224) {
            throw new Error(`VIDEO_RESOLUTION_TOO_LARGE: 4K resolution (${width}×${height}) exceeds browser hardware encoder limits.`);
          }
          chosenCodec = 'avc1.4d002a';
        }
      } catch (e) {
        if (e.message && e.message.includes('VIDEO_RESOLUTION_TOO_LARGE')) {
          throw e;
        }
        if (pixelCount > 2_228_224) {
          chosenCodec = 'avc1.4d0033';
        } else {
          chosenCodec = 'avc1.4d002a';
        }
      }
    }

    try {
      videoEncoder.configure({
        codec: chosenCodec,
        width,
        height,
        bitrate: targetBitrate,
        framerate: fps,
        latencyMode: 'quality',
        avc: { format: 'avc' }
      });
    } catch (confErr) {
      if (pixelCount > 2_228_224 || (confErr.message && confErr.message.includes('exceeds the maximum coded area'))) {
        throw new Error(`VIDEO_RESOLUTION_TOO_LARGE: 4K resolution (${width}×${height}) exceeds browser hardware encoder limits.`);
      }
      throw confErr;
    }

    const tStart = performance.now();
    let frameCount = 0;

    try {
      for (let f = 0; f < totalFrames; f++) {
        if (abortSignal && abortSignal.aborted) {
          throw new Error('Video processing cancelled by user.');
        }
        if (encoderError) {
          throw encoderError;
        }

        const targetTime = actualStart + (f * frameIntervalSec);

        // Await seeked event synchronized with the browser compositor
        // This ensures the hardware decoder has actually rendered the new frame to the texture
        if (Math.abs(video.currentTime - targetTime) > 0.0001) {
          await new Promise((resolve) => {
            let done = false;
            let timer = null;

            const finish = () => {
              if (!done) {
                done = true;
                if (timer) clearTimeout(timer);
                video.removeEventListener('seeked', onSeeked);
                resolve();
              }
            };

            const onSeeked = () => {
              // Wait for compositor frame presentation to guarantee fresh decoded pixels
              if ('requestVideoFrameCallback' in video) {
                video.requestVideoFrameCallback(() => finish());
                setTimeout(finish, 40);
              } else {
                setTimeout(finish, 15);
              }
            };

            timer = setTimeout(finish, 250);
            video.addEventListener('seeked', onSeeked, { once: true });
            video.currentTime = targetTime;
          });
        }

        // Draw fresh decoded video frame to canvas
        ctx.drawImage(video, 0, 0, width, height);

        // Apply CleanMark Zero-Blur Mathematical Unblend
        unblendCanvasRegion(ctx, width, height, box, star, gain);

        // Feed to WebCodecs hardware encoder with EXPLICIT MICROSECOND DURATION!
        // Exact microsecond frame timestamps & durations adhering to MPEG-4 Part 14 stts specifications
        if (videoEncoder.state === 'configured') {
          const timestampMicros = Math.round((f * 1_000_000) / fps);
          const nextTimestampMicros = Math.round(((f + 1) * 1_000_000) / fps);
          const sampleDurationMicros = nextTimestampMicros - timestampMicros;
          const frame = new VideoFrame(canvas, {
            timestamp: timestampMicros,
            duration: sampleDurationMicros
          });
          videoEncoder.encode(frame, { keyFrame: f % (fps * 2) === 0 });
          frame.close();
        }

        frameCount++;
        const elapsedSec = (performance.now() - tStart) / 1000;
        const currentFps = elapsedSec > 0 ? (frameCount / elapsedSec).toFixed(1) : 0;
        const pct = Math.min(99, Math.round((frameCount / totalFrames) * 100));

        onProgress({
          status: 'processing',
          progress: pct,
          frame: frameCount,
          total_frames: totalFrames,
          fps: parseFloat(currentFps)
        });
      }

      await videoEncoder.flush();
      muxer.finalize();

      const { buffer } = muxer.target;
      const cleanedBlob = new Blob([buffer], { type: 'video/mp4' });
      const cleanedUrl = URL.createObjectURL(cleanedBlob);

      onProgress({
        status: 'completed',
        progress: 100,
        frame: totalFrames,
        total_frames: totalFrames
      });

      return {
        success: true,
        blob: cleanedBlob,
        url: cleanedUrl,
        width,
        height,
        fps,
        duration: targetDuration,
        sizeBytes: cleanedBlob.size,
        filename: `cleanmark_${Date.now()}.mp4`
      };
    } finally {
      URL.revokeObjectURL(videoUrl);
      if (videoEncoder.state !== 'closed') {
        try { videoEncoder.close(); } catch (e) {}
      }
    }

  } else {
    // === PIPELINE B: MediaRecorder Fallback (for older browsers) ===
    return await new Promise((resolve) => {
      const stream = canvas.captureStream(fps);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const cleanedBlob = new Blob(chunks, { type: mimeType });
        const cleanedUrl = URL.createObjectURL(cleanedBlob);
        URL.revokeObjectURL(videoUrl);
        resolve({
          success: true,
          blob: cleanedBlob,
          url: cleanedUrl,
          width,
          height,
          fps,
          duration: targetDuration,
          sizeBytes: cleanedBlob.size,
          filename: `cleanmark_${Date.now()}.webm`
        });
      };

      recorder.start();
      video.currentTime = actualStart;
      video.play();

      const interval = setInterval(() => {
        if (video.ended || video.currentTime >= actualEnd) {
          clearInterval(interval);
          video.pause();
          recorder.stop();
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        unblendCanvasRegion(ctx, width, height, box, star, gain);

        const currentProg = Math.min(99, Math.round(((video.currentTime - actualStart) / targetDuration) * 100));
        onProgress({
          status: 'processing',
          progress: currentProg,
          frame: Math.round(video.currentTime * fps),
          total_frames: totalFrames,
          fps
        });
      }, frameIntervalSec * 1000);
    });
  }
}
