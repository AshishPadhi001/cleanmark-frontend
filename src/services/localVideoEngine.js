/**
 * CleanMark AI — High-Performance In-Browser Video Watermark Removal Engine
 * Uses WebCodecs (VideoEncoder) + mp4-muxer + Canvas 2D unblending.
 * Runs 100% locally on the user's hardware with 0 server calls and 0MB network transfer.
 */
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { unblendCropImageData } from '../utils/alphaUnblend';

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
 * High-speed In-Browser Video Processing Pipeline
 * Universally supported across modern browsers (Chrome, Edge, Safari, Brave, Opera).
 * Steps through frames, unblends watermark mathematically on canvas, and encodes directly to MP4.
 */
export async function processVideoLocally({
  videoFile,
  box,
  star,
  gain = 0.28,
  startSec = 0,
  endSec = null,
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
    video.onloadedmetadata = () => resolve();
    video.onerror = (e) => reject(new Error('Failed to load video metadata for local processing'));
  });

  // Ensure dimensions are even numbers (required by H.264 codecs)
  let width = video.videoWidth;
  let height = video.videoHeight;
  if (width % 2 !== 0) width -= 1;
  if (height % 2 !== 0) height -= 1;

  const duration = video.duration || 1;
  const actualStart = Math.max(0, startSec);
  const actualEnd = endSec && endSec > actualStart ? Math.min(duration, endSec) : duration;
  const targetDuration = actualEnd - actualStart;

  // Standard 30 FPS processing
  const fps = 30;
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
      },
      fastStart: 'in-memory'
    });

    let encoderError = null;
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => {
        console.error('[LocalVideoEngine] VideoEncoder error:', e);
        encoderError = e;
      }
    });

    const targetBitrate = Math.min(14_000_000, Math.max(2_500_000, width * height * fps * 0.18));

    videoEncoder.configure({
      codec: 'avc1.4d002a', // H.264 High Profile Level 4.2
      width,
      height,
      bitrate: targetBitrate,
      framerate: fps,
    });

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

        const targetTime = actualStart + f * frameIntervalSec;
        video.currentTime = targetTime;

        // Await seeked event with fallback safety timer
        await new Promise((resolve) => {
          let done = false;
          const timer = setTimeout(() => {
            if (!done) { done = true; video.removeEventListener('seeked', onSeeked); resolve(); }
          }, 200);
          const onSeeked = () => {
            if (!done) { done = true; clearTimeout(timer); video.removeEventListener('seeked', onSeeked); resolve(); }
          };
          video.addEventListener('seeked', onSeeked, { once: true });
        });

        // Draw original video frame
        ctx.drawImage(video, 0, 0, width, height);

        // Apply CleanMark Zero-Blur Mathematical Unblend
        unblendCanvasRegion(ctx, width, height, box, star, gain);

        // Feed to WebCodecs hardware encoder
        if (videoEncoder.state === 'configured') {
          const timestampMicros = Math.round(f * (1_000_000 / fps));
          const frame = new VideoFrame(canvas, { timestamp: timestampMicros });
          videoEncoder.encode(frame, { keyFrame: f % 60 === 0 });
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
    return await new Promise((resolve, reject) => {
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
          fps: 30
        });
      }, frameIntervalSec * 1000);
    });
  }
}
