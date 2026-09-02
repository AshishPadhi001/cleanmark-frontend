// Precomputed 96x96 pristine alpha map for instant 0ms unblending
import { ALPHA_96_FLAT, ALPHA_96_SIZE } from './alphaData';

export { ALPHA_96_FLAT, ALPHA_96_SIZE };

/**
 * Computes exact pixel coordinates of the Google Veo / Gemini watermark
 * for ANY video resolution and aspect ratio (16:9, 9:16, 1:1, etc.)
 */
export function getVeoWatermarkGeometry(vw, vh, preset = 'bottom-right') {
  const minDim = Math.min(vw, vh);
  const size = Math.max(24, Math.min(Math.round(minDim / 15.0), minDim));
  const margin = round(minDim / 10.0);

  let starX = Math.max(0, vw - margin - size - 24);
  let starY = Math.max(0, vh - margin - size - 24);

  if (preset === 'bottom-left') {
    starX = margin + 24;
    starY = Math.max(0, vh - margin - size - 24);
  } else if (preset === 'top-right') {
    starX = Math.max(0, vw - margin - size - 24);
    starY = margin + 24;
  } else if (preset === 'top-left') {
    starX = margin + 24;
    starY = margin + 24;
  }

  function round(v) { return Math.round(v); }

  // UI Selection Box dimensions (1.8x size with padding centered over star)
  const boxW = Math.round(size * 1.8);
  const boxH = Math.round(size * 1.8);
  const boxX = Math.max(0, Math.min(vw - boxW, starX - Math.round((boxW - size) / 2)));
  const boxY = Math.max(0, Math.min(vh - boxH, starY - Math.round((boxH - size) / 2)));

  return {
    box: {
      x: boxX / vw,
      y: boxY / vh,
      w: boxW / vw,
      h: boxH / vh,
    },
    star: {
      x: starX,
      y: starY,
      size: size
    }
  };
}

/**
 * Resizes 96x96 alpha map to targetSize x targetSize (bilinear interpolation)
 */
export function getScaledAlphaMap(targetSize) {
  const map = new Float32Array(targetSize * targetSize);
  const scale = (ALPHA_96_SIZE - 1) / Math.max(1, targetSize - 1);

  for (let r = 0; r < targetSize; r++) {
    const srcY = r * scale;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(ALPHA_96_SIZE - 1, y0 + 1);
    const dy = srcY - y0;

    for (let c = 0; c < targetSize; c++) {
      const srcX = c * scale;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(ALPHA_96_SIZE - 1, x0 + 1);
      const dx = srcX - x0;

      const v00 = ALPHA_96_FLAT[y0 * ALPHA_96_SIZE + x0];
      const v01 = ALPHA_96_FLAT[y0 * ALPHA_96_SIZE + x1];
      const v10 = ALPHA_96_FLAT[y1 * ALPHA_96_SIZE + x0];
      const v11 = ALPHA_96_FLAT[y1 * ALPHA_96_SIZE + x1];

      const val = (1 - dx) * (1 - dy) * v00 + dx * (1 - dy) * v01 + (1 - dx) * dy * v10 + dx * dy * v11;
      map[r * targetSize + c] = val;
    }
  }
  return map;
}

/**
 * Fast client-side unblending on ImageData
 */
export function unblendCropImageData(imgData, cropW, cropH, starX, starY, starSize, gain) {
  const alphaMap = getScaledAlphaMap(starSize);
  const data = imgData.data;

  for (let r = 0; r < starSize; r++) {
    const py = starY + r;
    if (py < 0 || py >= cropH) continue;

    for (let c = 0; c < starSize; c++) {
      const px = starX + c;
      if (px < 0 || px >= cropW) continue;

      const aRaw = alphaMap[r * starSize + c];
      const a = Math.min(0.99, aRaw * gain);
      if (a < 0.002) continue;

      const pIdx = (py * cropW + px) * 4;
      const invA = 1.0 - a;
      const sub = a * 255.0;

      data[pIdx]     = Math.max(0, Math.min(255, Math.round((data[pIdx]     - sub) / invA)));
      data[pIdx + 1] = Math.max(0, Math.min(255, Math.round((data[pIdx + 1] - sub) / invA)));
      data[pIdx + 2] = Math.max(0, Math.min(255, Math.round((data[pIdx + 2] - sub) / invA)));
    }
  }
}
