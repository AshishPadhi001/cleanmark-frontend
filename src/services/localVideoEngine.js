/**
 * CleanMark AI — High-Performance In-Browser Video Watermark Removal Engine
 *
 * Phase 1 Complete:
 *  Task 1.1 ✅ Mathematical Alpha Unblend (zero blur)
 *  Task 1.2 ✅ mp4box.js Demuxer (chunked buffer + seek fallback)
 *  Task 1.3 ✅ WebCodecs VideoEncoder (H.264 AVC, dynamic level by resolution)
 *  Task 1.4 ✅ Audio Preservation (AAC passthrough + AudioContext WebCodecs fallback)
 *  Task 1.5 ✅ Live Progress HUD (frame count, FPS, %)
 *
 * 100% local · 0 server calls · 0 MB network transfer
 */
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import * as MP4Box from 'mp4box';
import { unblendCropImageData } from '../utils/alphaUnblend';

// ─────────────────────────────────────────────────────────────
//  Task 1.2 — MP4Box Demuxer: extracts FPS + raw audio samples
// ─────────────────────────────────────────────────────────────

export async function extractVideoMetadata(file) {
  if (!file) return null;

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (res) => {
      if (resolved) return;
      resolved = true;
      resolve(res);
    };

    const timeout = setTimeout(() => finish(null), 5000);

    try {
      const mp4boxfile = MP4Box.createFile();
      let videoTrackId = null;
      let audioTrackId = null;
      let audioMeta = null;
      let videoMeta = null;
      const audioSamples = [];

      mp4boxfile.onReady = function (info) {
        const vt = (info.videoTracks && info.videoTracks.length > 0)
          ? info.videoTracks[0]
          : (info.tracks || []).find(t => t.video);

        let fps = null;
        if (vt && vt.nb_samples && vt.duration && vt.timescale) {
          const calc = vt.nb_samples / (vt.duration / vt.timescale);
          if (calc > 0 && calc <= 240) fps = Math.round(calc * 100) / 100;
        }
        videoTrackId = vt ? vt.id : null;
        videoMeta = { fps, duration: info.duration ? info.duration / info.timescale : null };

        const at = info.audioTracks && info.audioTracks.length > 0
          ? info.audioTracks[0] : null;

        if (at) {
          audioTrackId = at.id;
          audioMeta = {
            audioCodec:        at.codec || 'mp4a.40.2',
            audioTimescale:    at.timescale,
            audioChannelCount: at.audio ? at.audio.channel_count : 2,
            audioSampleRate:   at.audio ? at.audio.sample_rate  : 44100,
            audioBitsPerSample:at.audio ? at.audio.sample_size  : 16,
          };

          mp4boxfile.setExtractionOptions(at.id, null, { nbSamples: at.nb_samples || 99999 });
        }

        mp4boxfile.start();
      };

      mp4boxfile.onSamples = function (trackId, _ref, samples) {
        if (trackId === audioTrackId) {
          for (const s of samples) {
            audioSamples.push(s);
          }
        }
      };

      mp4boxfile.onFlush = function () {
        clearTimeout(timeout);
        finish({
          ...videoMeta,
          audioSamples,
          ...audioMeta,
        });
      };

      mp4boxfile.onError = () => {
        clearTimeout(timeout);
        finish(videoMeta);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buf = e.target.result;
          const chunkSize = 512 * 1024;
          let offset = 0;

          while (offset < buf.byteLength) {
            const chunk = buf.slice(offset, Math.min(buf.byteLength, offset + chunkSize));
            chunk.fileStart = offset;
            mp4boxfile.appendBuffer(chunk);
            offset += chunkSize;
          }
          mp4boxfile.flush();
        } catch (err) {
          clearTimeout(timeout);
          finish(null);
        }
      };
      reader.onerror = () => { clearTimeout(timeout); finish(null); };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      clearTimeout(timeout);
      finish(null);
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  Canvas unblend helper
// ─────────────────────────────────────────────────────────────

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

  sx = Math.max(0, Math.min(canvasWidth - 1, sx));
  sy = Math.max(0, Math.min(canvasHeight - 1, sy));
  if (sx + sSize > canvasWidth)  sSize = canvasWidth  - sx;
  if (sy + sSize > canvasHeight) sSize = canvasHeight - sy;
  if (sSize <= 4) return;

  const patch = ctx.getImageData(sx, sy, sSize, sSize);
  unblendCropImageData(patch, sSize, sSize, 0, 0, sSize, gain);
  ctx.putImageData(patch, sx, sy);
}

// ─────────────────────────────────────────────────────────────
//  Audio Fallback helper: Web Audio API + WebCodecs AudioEncoder
// ─────────────────────────────────────────────────────────────

async function processAudioViaWebAudio(videoFile, muxer, actualStart, actualEnd) {
  try {
    const arrayBuffer = await videoFile.arrayBuffer();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    const audioCtx = new AudioContextClass();
    let audioBuffer = null;
    try {
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
      await audioCtx.close();
      return false;
    }

    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const totalDuration = audioBuffer.duration;

    if (!audioBuffer || numberOfChannels === 0 || totalDuration === 0) {
      await audioCtx.close();
      return false;
    }

    const startSample = Math.max(0, Math.floor(actualStart * sampleRate));
    const endSample   = Math.min(audioBuffer.length, Math.ceil(actualEnd * sampleRate));
    const sampleLength = endSample - startSample;

    if (sampleLength <= 0) {
      await audioCtx.close();
      return false;
    }

    const channelsData = [];
    for (let c = 0; c < numberOfChannels; c++) {
      channelsData.push(audioBuffer.getChannelData(c).subarray(startSample, endSample));
    }

    if (typeof window.AudioEncoder !== 'function') {
      await audioCtx.close();
      return false;
    }

    const audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error('[LocalVideoEngine] AudioEncoder error:', e),
    });

    audioEncoder.configure({
      codec: 'mp4a.40.2',
      numberOfChannels,
      sampleRate,
      bitrate: 128_000,
    });

    const frameSize = 1024;
    let frameOffset = 0;

    while (frameOffset < sampleLength) {
      const currentFrameSize = Math.min(frameSize, sampleLength - frameOffset);
      const planarBuffer = new Float32Array(numberOfChannels * currentFrameSize);

      for (let c = 0; c < numberOfChannels; c++) {
        const channelSource = channelsData[c];
        const destOffset = c * currentFrameSize;
        for (let i = 0; i < currentFrameSize; i++) {
          planarBuffer[destOffset + i] = channelSource[frameOffset + i];
        }
      }

      const timestampMicros = Math.round((frameOffset / sampleRate) * 1_000_000);
      const audioData = new AudioData({
        format: 'f32-planar',
        sampleRate,
        numberOfChannels,
        numberOfFrames: currentFrameSize,
        timestamp: timestampMicros,
        data: planarBuffer,
      });

      audioEncoder.encode(audioData);
      audioData.close();
      frameOffset += currentFrameSize;
    }

    await audioEncoder.flush();
    audioEncoder.close();
    await audioCtx.close();
    return true;

  } catch (err) {
    console.warn('[LocalVideoEngine] Web Audio encoding fallback error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
//  Main Processing Pipeline
// ─────────────────────────────────────────────────────────────

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
    if (video.readyState >= 2) { resolve(); return; }
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video for processing'));
  });

  let width  = video.videoWidth;
  let height = video.videoHeight;
  if (width  % 2 !== 0) width  -= 1;
  if (height % 2 !== 0) height -= 1;

  const duration   = video.duration || 1;
  const actualStart = Math.max(0, startSec);
  const actualEnd   = endSec && endSec > actualStart ? Math.min(duration, endSec) : duration;
  const targetDuration = actualEnd - actualStart;

  onProgress({ status: 'demuxing', progress: 0, frame: 0, total_frames: 0 });

  let fps           = 24;
  let audioSamples  = [];
  let audioTimescale = 44100;
  let audioCodec    = 'mp4a.40.2';
  let audioChannelCount = 2;
  let audioSampleRate   = 44100;

  try {
    const meta = await extractVideoMetadata(videoFile);
    if (meta) {
      if (meta.fps && meta.fps > 0) fps = Math.round(meta.fps);
      if (meta.audioSamples && meta.audioSamples.length > 0) {
        audioSamples      = meta.audioSamples;
        audioTimescale    = meta.audioTimescale    || 44100;
        audioCodec        = meta.audioCodec        || 'mp4a.40.2';
        audioChannelCount = meta.audioChannelCount || 2;
        audioSampleRate   = meta.audioSampleRate   || 44100;
      }
    }
  } catch (e) {
    console.warn('[LocalVideoEngine] Metadata probe failed, using defaults:', e);
  }

  if (typeof requestedFps === 'number' && requestedFps > 0) fps = Math.round(requestedFps);
  fps = Math.max(12, Math.min(120, fps));

  const totalFrames      = Math.max(1, Math.round(targetDuration * fps));
  const frameIntervalSec = 1.0 / fps;

  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const supportsWebCodecs = typeof window !== 'undefined' && 'VideoEncoder' in window;

  if (supportsWebCodecs) {
    const hasRawAudio = audioSamples.length > 0;

    const muxerOptions = {
      target: new ArrayBufferTarget(),
      video: { codec: 'avc', width, height, rotation: 0 },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'strict',
      audio: {
        codec:       'aac',
        sampleRate:  audioSampleRate,
        numberOfChannels: audioChannelCount,
      }
    };

    const muxer = new Muxer(muxerOptions);

    let encoderError = null;
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => { console.error('[LocalVideoEngine] VideoEncoder error:', e); encoderError = e; }
    });

    const pixelCount    = width * height;
    const targetBitrate = Math.min(24_000_000, Math.max(2_500_000, pixelCount * fps * 0.18));

    let chosenCodec = 'avc1.4d002a';
    if (pixelCount > 2_228_224)      chosenCodec = 'avc1.4d0033';
    else if (pixelCount <= 921_600)  chosenCodec = 'avc1.42001f';

    if (typeof VideoEncoder.isConfigSupported === 'function') {
      try {
        const sup = await VideoEncoder.isConfigSupported({ codec: chosenCodec, width, height, bitrate: targetBitrate, framerate: fps });
        if (!sup || !sup.supported) {
          if (pixelCount > 2_228_224) throw new Error(`VIDEO_RESOLUTION_TOO_LARGE: 4K resolution (${width}×${height}) exceeds browser encoder limits.`);
          chosenCodec = 'avc1.4d002a';
        }
      } catch (e) {
        if (e.message && e.message.includes('VIDEO_RESOLUTION_TOO_LARGE')) throw e;
        chosenCodec = pixelCount > 2_228_224 ? 'avc1.4d0033' : 'avc1.4d002a';
      }
    }

    try {
      videoEncoder.configure({
        codec: chosenCodec, width, height, bitrate: targetBitrate,
        framerate: fps, latencyMode: 'quality', avc: { format: 'avc' }
      });
    } catch (confErr) {
      if (pixelCount > 2_228_224 || confErr.message?.includes('exceeds the maximum coded area')) {
        throw new Error(`VIDEO_RESOLUTION_TOO_LARGE: 4K resolution (${width}×${height}) exceeds browser encoder limits.`);
      }
      throw confErr;
    }

    const tStart = performance.now();
    let frameCount = 0;

    try {
      for (let f = 0; f < totalFrames; f++) {
        if (abortSignal?.aborted) throw new Error('Video processing cancelled by user.');
        if (encoderError) throw encoderError;

        const targetTime = actualStart + (f * frameIntervalSec);

        if (Math.abs(video.currentTime - targetTime) > 0.0001) {
          await new Promise((resolve) => {
            let done = false;
            let timer = null;
            const finish = () => {
              if (!done) { done = true; if (timer) clearTimeout(timer); video.removeEventListener('seeked', onSeeked); resolve(); }
            };
            const onSeeked = () => {
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

        ctx.drawImage(video, 0, 0, width, height);
        unblendCanvasRegion(ctx, width, height, box, star, gain);

        if (videoEncoder.state === 'configured') {
          const timestampMicros     = Math.round((f * 1_000_000) / fps);
          const nextTimestampMicros = Math.round(((f + 1) * 1_000_000) / fps);
          const frame = new VideoFrame(canvas, {
            timestamp: timestampMicros,
            duration:  nextTimestampMicros - timestampMicros,
          });
          videoEncoder.encode(frame, { keyFrame: f % (fps * 2) === 0 });
          frame.close();
        }

        frameCount++;
        const elapsedSec = (performance.now() - tStart) / 1000;
        const currentFps = elapsedSec > 0 ? (frameCount / elapsedSec).toFixed(1) : 0;

        onProgress({
          status:       'processing',
          progress:     Math.min(99, Math.round((frameCount / totalFrames) * 100)),
          frame:        frameCount,
          total_frames: totalFrames,
          fps:          parseFloat(currentFps),
        });
      }

      await videoEncoder.flush();

      let hasAudioProcessed = false;

      if (hasRawAudio) {
        onProgress({ status: 'muxing_audio', progress: 99, frame: totalFrames, total_frames: totalFrames });

        const startUs = Math.round(actualStart * 1_000_000);
        const endUs   = Math.round(actualEnd   * 1_000_000);
        let firstAudioPts = null;

        for (const sample of audioSamples) {
          const samplePts = Math.round((sample.cts / audioTimescale) * 1_000_000);
          if (samplePts < startUs || samplePts >= endUs) continue;

          if (firstAudioPts === null) firstAudioPts = samplePts;
          const normalisedPts = samplePts - firstAudioPts;
          const normalisedDur = Math.round((sample.duration / audioTimescale) * 1_000_000);

          const chunk = new EncodedAudioChunk({
            type:      'key',
            timestamp: normalisedPts,
            duration:  normalisedDur,
            data:      sample.data,
          });
          muxer.addAudioChunk(chunk, { decoderConfig: { codec: audioCodec, sampleRate: audioSampleRate, numberOfChannels: audioChannelCount } });
          hasAudioProcessed = true;
        }
      }

      if (!hasAudioProcessed) {
        onProgress({ status: 'muxing_audio', progress: 99, frame: totalFrames, total_frames: totalFrames });
        hasAudioProcessed = await processAudioViaWebAudio(videoFile, muxer, actualStart, actualEnd);
      }

      muxer.finalize();

      const { buffer }    = muxer.target;
      const cleanedBlob   = new Blob([buffer], { type: 'video/mp4' });
      const cleanedUrl    = URL.createObjectURL(cleanedBlob);

      onProgress({ status: 'completed', progress: 100, frame: totalFrames, total_frames: totalFrames });

      return {
        success:    true,
        blob:       cleanedBlob,
        url:        cleanedUrl,
        width,
        height,
        fps,
        duration:   targetDuration,
        sizeBytes:  cleanedBlob.size,
        hasAudio:   hasAudioProcessed,
        filename:   `cleanmark_${Date.now()}.mp4`,
      };

    } finally {
      URL.revokeObjectURL(videoUrl);
      if (videoEncoder.state !== 'closed') {
        try { videoEncoder.close(); } catch (_) {}
      }
    }

  } else {
    return await new Promise((resolve) => {
      const stream   = canvas.captureStream(fps);
      let mimeType   = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks   = [];

      recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const cleanedBlob = new Blob(chunks, { type: mimeType });
        URL.revokeObjectURL(videoUrl);
        resolve({
          success: true, blob: cleanedBlob, url: URL.createObjectURL(cleanedBlob),
          width, height, fps, duration: targetDuration,
          sizeBytes: cleanedBlob.size, hasAudio: false,
          filename: `cleanmark_${Date.now()}.webm`,
        });
      };

      recorder.start();
      video.currentTime = actualStart;
      video.play();

      const interval = setInterval(() => {
        if (video.ended || video.currentTime >= actualEnd) {
          clearInterval(interval); video.pause(); recorder.stop(); return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        unblendCanvasRegion(ctx, width, height, box, star, gain);
        onProgress({
          status: 'processing',
          progress: Math.min(99, Math.round(((video.currentTime - actualStart) / targetDuration) * 100)),
          frame: Math.round(video.currentTime * fps),
          total_frames: Math.round(targetDuration * fps),
          fps,
        });
      }, frameIntervalSec * 1000);
    });
  }
}
