// CleanMark Studio - Universal API Configuration
const envBase = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '';
const isDesktop = typeof window !== 'undefined' && (
  window.location.protocol === 'file:' ||
  Boolean(window.desktopAPI?.isDesktop)
);

export const SERVER_ROOT = envBase || (isDesktop ? 'http://127.0.0.1:8000' : '');
export const API_BASE = SERVER_ROOT ? `${SERVER_ROOT}/api` : '/api';

console.info(`[CleanMark API] Initialized with API_BASE: "${API_BASE}", SERVER_ROOT: "${SERVER_ROOT}"`);

/**
 * Check backend model readiness and device info
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[CleanMark API] Health check failed, backend might be starting...', err.message);
    return { status: 'offline', model_ready: false };
  }
}

/**
 * Flexible Single Image Watermark Remover
 * Supports BOTH positional arguments: inpaintImage(file, maskBlob, dilation)
 * and options object: cleanImage({ imageFile, maskBlob, preset, boxX, ... })
 */
export async function cleanImage(arg1, arg2, arg3) {
  const formData = new FormData();

  if (arg1 instanceof File || arg1 instanceof Blob) {
    // Positional signature: (file, maskBlob, dilation/options)
    formData.append('image', arg1, arg1.name || 'image.png');
    if (arg2 instanceof Blob || arg2 instanceof File) {
      formData.append('mask', arg2, 'mask.png');
    } else if (typeof arg2 === 'string' && arg2.length > 0) {
      formData.append('mask_base64', arg2);
    }
    if (typeof arg3 === 'number') {
      formData.append('dilation', arg3);
    } else if (typeof arg3 === 'object' && arg3 !== null) {
      if (arg3.preset) formData.append('preset', arg3.preset);
      if (arg3.boxX !== undefined) formData.append('box_x', arg3.boxX);
      if (arg3.boxY !== undefined) formData.append('box_y', arg3.boxY);
      if (arg3.boxW !== undefined) formData.append('box_w', arg3.boxW);
      if (arg3.boxH !== undefined) formData.append('box_h', arg3.boxH);
    }
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    // Options object signature: { imageFile, maskBlob, ... }
    const file = arg1.imageFile || arg1.file || arg1.image;
    if (file instanceof File || file instanceof Blob) {
      formData.append('image', file, file.name || 'image.png');
    }
    const mask = arg1.maskBlob || arg1.mask;
    if (mask instanceof File || mask instanceof Blob) {
      formData.append('mask', mask, 'mask.png');
    } else if (arg1.maskBase64) {
      formData.append('mask_base64', arg1.maskBase64);
    }
    if (arg1.preset) formData.append('preset', arg1.preset);
    if (arg1.dilation !== undefined) formData.append('dilation', arg1.dilation);
    if (arg1.boxX !== undefined && arg1.boxX !== null) formData.append('box_x', arg1.boxX);
    if (arg1.boxY !== undefined && arg1.boxY !== null) formData.append('box_y', arg1.boxY);
    if (arg1.boxW !== undefined && arg1.boxW !== null) formData.append('box_w', arg1.boxW);
    if (arg1.boxH !== undefined && arg1.boxH !== null) formData.append('box_h', arg1.boxH);
    if (arg1.gain !== undefined) formData.append('gain', arg1.gain);
    if (arg1.sizeScale !== undefined) formData.append('size_scale', arg1.sizeScale);
  }

  const res = await fetch(`${API_BASE}/image/clean`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Watermark removal failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Batch Image Cleaning
 * Supports payload array: inpaintBatch([{ file, maskBlob }, ...])
 */
export async function inpaintBatch(readyPayloads, dilation = 3) {
  const formData = new FormData();

  readyPayloads.forEach((item, idx) => {
    const file = item.file || item.imageFile || item.image;
    if (file) {
      formData.append('images', file, file.name || `image_${idx+1}.png`);
    }
    const mask = item.maskBlob || item.mask;
    if (mask) {
      formData.append('masks', mask, `mask_${idx+1}.png`);
    }
  });

  if (dilation) formData.append('dilation', dilation);

  const res = await fetch(`${API_BASE}/image/batch`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Batch inpainting failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

export const inpaintImage = cleanImage;
export const cleanBatchImages = inpaintBatch;

/**
 * Extract video metadata and first frame preview
 */
export async function getVideoInfo(videoFile) {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('session_id', getClientSessionId());

  const res = await fetch(`${API_BASE}/video/info`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Video analysis failed: ${err}`);
  }

  return await res.json();
}

/**
 * Stream real-time video watermark removal progress via SSE
 */
export async function cleanVideoStream({
  videoFile,
  videoId,
  maskBlob,
  maskBase64,
  preset,
  removalMode = 'unblend',
  unblendGain = -1,  // -1 = AUTO (backend TV minimization solver)
  offsetX = -24,
  offsetY = -24,
  sizeScale = 1.0,
  boxX,
  boxY,
  boxW,
  boxH,
  startSec = 0,
  endSec = null,
  temporalSmoothing = false,
  onProgress,
  onComplete,
  onError,
}) {
  const formData = new FormData();
  formData.append('session_id', getClientSessionId());
  // If videoId already exists from /info upload, only send video_id (payload < 1KB)!
  // Only upload the raw video file if videoId is missing.
  if (videoId) {
    formData.append('video_id', videoId);
  } else if (videoFile) {
    formData.append('video', videoFile);
  }
  if (maskBlob) formData.append('mask', maskBlob, 'mask.png');
  if (maskBase64) formData.append('mask_base64', maskBase64);
  if (preset) formData.append('preset', preset);
  formData.append('removal_mode', removalMode);
  formData.append('unblend_gain', unblendGain);
  formData.append('offset_x', offsetX);
  formData.append('offset_y', offsetY);
  formData.append('size_scale', sizeScale);
  if (boxX !== undefined && boxX !== null) formData.append('box_x', boxX);
  if (boxY !== undefined && boxY !== null) formData.append('box_y', boxY);
  if (boxW !== undefined && boxW !== null) formData.append('box_w', boxW);
  if (boxH !== undefined && boxH !== null) formData.append('box_h', boxH);
  formData.append('start_sec', startSec);
  if (endSec !== null && endSec !== undefined) formData.append('end_sec', endSec);
  formData.append('temporal_smoothing', temporalSmoothing);

  try {
    const response = await fetch(`${API_BASE}/video/clean`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Server returned error ${response.status}: ${err}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace(/^data:\s*/, '').trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.status === 'processing' || data.status === 'starting' || data.status === 'remuxing') {
              if (onProgress) onProgress(data);
            } else if (data.status === 'completed') {
              if (onComplete) onComplete(data);
            } else if (data.status === 'error') {
              if (onError) onError(new Error(data.message || 'Video processing failed'));
            }
          } catch (jsonErr) {
            console.warn('[CleanMark API] SSE JSON parse error:', jsonErr, line);
          }
        }
      }
    }
  } catch (err) {
    console.error('[CleanMark API] cleanVideoStream error:', err);
    if (onError) onError(err);
  }
}

export function getVideoDownloadUrl(videoId) {
  return `${API_BASE}/video/download/${videoId}`;
}

export function getVideoStreamUrl(videoId) {
  return `${API_BASE}/video/stream/${videoId}`;
}


/**
 * Returns or creates a persistent session ID for the active browser tab
 */
export function getClientSessionId() {
  let sid = sessionStorage.getItem('cleanmark_video_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('cleanmark_video_session', sid);
  }
  return sid;
}

export async function clearVideoSession(sessionId) {
  try {
    const sid = sessionId || getClientSessionId();
    await fetch(`${API_BASE}/video/session/${sid}/clear`, {
      method: 'DELETE',
      keepalive: true // Ensures delivery even if the user closes the tab immediately
    });
  } catch (e) {
    // Ignore cleanup network errors on page unload
  }
}


export async function initSessionAndPurgeOld() {
  try {
    const sid = getClientSessionId();
    const formData = new FormData();
    formData.append('session_id', sid);
    const res = await fetch(`${API_BASE}/video/session/init`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (e) {
    // Ignore network errors if offline
  }
}
