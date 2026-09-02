// CleanMark AI - Complete Mathematical Watermark Engine (0 Blur, Zero-PyTorch)
// Ported from Ishara Maduranga's precision Gemini & Veo removal algorithms

import { BG_48_BASE64, BG_96_BASE64 } from './watermarkAssets';

export const ALPHA_THRESHOLD = 0.002;
export const MAX_ALPHA = 0.99;
export const LOGO_VALUE = 255;

export function calculateAlphaMap(bgCaptureImageData) {
  const { width, height, data } = bgCaptureImageData;
  const alphaMap = new Float32Array(width * height);
  for (let i = 0; i < alphaMap.length; i++) {
    const idx = i * 4;
    alphaMap[i] = Math.max(data[idx], data[idx + 1], data[idx + 2]) / 255.0;
  }
  return alphaMap;
}

export function getWatermarkInfo(width, height) {
  const minDim = Math.min(width, height);
  const ratio = minDim / 1536;
  const size = Math.max(16, Math.round(96 * ratio));
  const margin = Math.max(8, Math.round(64 * ratio));

  return {
    size,
    x: Math.max(0, width - margin - size),
    y: Math.max(0, height - margin - size),
    width: size,
    height: size,
  };
}

export function getVeoWatermark(width, height) {
  const base = Math.min(width, height);
  const size = Math.max(24, Math.min(Math.round(base / 15), base));
  const margin = Math.round(base / 10);
  return {
    size,
    x: Math.max(0, width - margin - size),
    y: Math.max(0, height - margin - size),
    width: size,
    height: size,
  };
}

export function resolveBox(base, width, height, opts = {}) {
  const offsetX = opts.offsetX || 0;
  const offsetY = opts.offsetY || 0;
  const sizeScale = opts.sizeScale || 1.0;

  const scaledSize = Math.max(8, Math.min(Math.round(base.size * sizeScale), Math.min(width, height)));
  const x = Math.max(0, Math.min(width - scaledSize, base.x + offsetX));
  const y = Math.max(0, Math.min(height - scaledSize, base.y + offsetY));

  return {
    x,
    y,
    width: scaledSize,
    height: scaledSize,
    size: scaledSize,
  };
}

export function getRoi(width, height, wm) {
  const pad = Math.max(8, Math.round(wm.size * 0.25));
  const x = Math.max(0, wm.x - pad);
  const y = Math.max(0, wm.y - pad);
  const w = Math.min(width - x, wm.width + pad * 2);
  const h = Math.min(height - y, wm.height + pad * 2);
  return { x, y, width: w, height: h };
}

export function buildAlpha(bgImg, roi, wm, gain = 1.0) {
  const canvas = document.createElement('canvas');
  canvas.width = roi.width;
  canvas.height = roi.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, roi.width, roi.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(bgImg, wm.x - roi.x, wm.y - roi.y, wm.width, wm.height);
  const imgData = ctx.getImageData(0, 0, roi.width, roi.height);
  const alpha = calculateAlphaMap(imgData);

  if (gain !== 1.0) {
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] = Math.min(MAX_ALPHA, alpha[i] * gain);
    }
  }
  return alpha;
}

export function removeWatermark(imageData, alphaMap, position, options = {}) {
  const { x, y, width, height } = position;
  const gain = options.alphaGain || 1.0;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
      const alphaIdx = row * width + col;

      let alpha = alphaMap[alphaIdx] * gain;
      if (alpha < ALPHA_THRESHOLD) continue;
      alpha = Math.min(alpha, MAX_ALPHA);

      for (let c = 0; c < 3; c++) {
        const watermarked = imageData.data[imgIdx + c];
        const original = (watermarked - alpha * LOGO_VALUE) / (1.0 - alpha);
        imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
      }
    }
  }
}

export function cleanFrame(bgImg, fullImageData, width, height, base, opts = {}) {
  const wm = resolveBox(base, width, height, opts);
  const roi = getRoi(width, height, wm);
  const alpha = buildAlpha(bgImg, roi, wm, opts.gain || 1.0);

  const region = { x: 0, y: 0, width: roi.width, height: roi.height };
  const roiImageData = new ImageData(roi.width, roi.height);

  for (let r = 0; r < roi.height; r++) {
    for (let c = 0; c < roi.width; c++) {
      const srcIdx = ((roi.y + r) * width + (roi.x + c)) * 4;
      const dstIdx = (r * roi.width + c) * 4;
      roiImageData.data[dstIdx] = fullImageData.data[srcIdx];
      roiImageData.data[dstIdx + 1] = fullImageData.data[srcIdx + 1];
      roiImageData.data[dstIdx + 2] = fullImageData.data[srcIdx + 2];
      roiImageData.data[dstIdx + 3] = fullImageData.data[srcIdx + 3];
    }
  }

  removeWatermark(roiImageData, alpha, region);

  for (let r = 0; r < roi.height; r++) {
    for (let c = 0; c < roi.width; c++) {
      const srcIdx = (r * roi.width + c) * 4;
      const dstIdx = ((roi.y + r) * width + (roi.x + c)) * 4;
      fullImageData.data[dstIdx] = roiImageData.data[srcIdx];
      fullImageData.data[dstIdx + 1] = roiImageData.data[srcIdx + 1];
      fullImageData.data[dstIdx + 2] = roiImageData.data[srcIdx + 2];
      fullImageData.data[dstIdx + 3] = roiImageData.data[srcIdx + 3];
    }
  }

  return { wm, roi };
}

export class WatermarkEngine {
  constructor(bg48, bg96) {
    this.bg48 = bg48;
    this.bg96 = bg96;
    this.alphaMaps = {};
  }

  static async create() {
    const loadImage = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    const [bg48, bg96] = await Promise.all([
      loadImage(BG_48_BASE64),
      loadImage(BG_96_BASE64),
    ]);
    return new WatermarkEngine(bg48, bg96);
  }

  async process(imageFile, opts = {}) {
    const objectUrl = URL.createObjectURL(imageFile);
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const base = getWatermarkInfo(canvas.width, canvas.height);

    cleanFrame(this.bg96, imageData, canvas.width, canvas.height, base, opts);
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    return {
      blob,
      url: URL.createObjectURL(blob),
      originalUrl: objectUrl,
      width: img.width,
      height: img.height,
    };
  }
}
