import { unblendCropImageData, getVeoWatermarkGeometry } from '../utils/alphaUnblend';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, Sparkles, Clock, ShieldCheck, Cpu, Layers,
  CheckCircle2, ArrowRight, Play, Pause, RotateCcw,
  Download, UploadCloud, Sliders, Eye, EyeOff, AlertCircle,
  Film, Scissors, Sparkle, RefreshCw, Zap, Volume2, Move,
  Maximize2, Lock, Columns, Check, ChevronRight, Gauge, Smartphone, Monitor
} from 'lucide-react';
import { getVideoInfo, cleanVideoStream, getVideoDownloadUrl, getVideoStreamUrl, clearVideoSession, getClientSessionId, initSessionAndPurgeOld } from '../config/api';


const BG_96_BASE64 = "data:image/png;base64,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";

// Preload alpha template for instant 60 FPS unblending
let cachedAlphaImage = null;
function getAlphaImage() {
  if (!cachedAlphaImage) {
    cachedAlphaImage = new Image();
    cachedAlphaImage.src = BG_96_BASE64;
  }
  return cachedAlphaImage;
}

export const FORMAT_CONFIGS = {
  '9:16': {
    id: '9:16',
    name: '9:16 Portrait',
    tag: 'Shorts / Reels / TikTok',
    refW: 720,
    refH: 1280,
    aspectRatio: '9/16',
  },
  '16:9': {
    id: '16:9',
    name: '16:9 Landscape',
    tag: 'YouTube / Standard',
    refW: 1280,
    refH: 720,
    aspectRatio: '16/9',
  },
};

export function getInitialPresetBox(formatKey = '9:16', presetKey = 'bottom-right') {
  const cfg = FORMAT_CONFIGS[formatKey] || FORMAT_CONFIGS['9:16'];
  return getVeoWatermarkGeometry(cfg.refW, cfg.refH, presetKey).box;
}

export default function VideoStudioPage() {
  // Video upload & metadata state
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Engine Mode: 'unblend' (Ultra-Fast Math Unblend, Zero Blur) | 'inpaint' (AI Neural Inpainting)
  const removalMode = 'unblend';  // Fixed: always use math unblend

  // Mathematical Unblend Tuning Parameters
  const [unblendGain, setUnblendGain] = useState(0.28);

  // Interactive Live Frame Preview & Removal Strength Slider
  const [sliderGain, setSliderGain] = useState(0.28);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(true);
  const previewCanvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  const [sizeScale, setSizeScale] = useState(1.0);

  // Watermark Bounding Box (Normalized 0..1)
  // Selected video format: '9:16' (Portrait - default) or '16:9' (Landscape)
  const [videoFormat, setVideoFormat] = useState('9:16');
  const [box, setBox] = useState(() => getInitialPresetBox('9:16', 'bottom-right'));
  const [activePreset, setActivePreset] = useState('bottom-right');

  // Dragging & Resizing State
  const [isDragging, setIsDragging] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [initialBox, setInitialBox] = useState(null);

  // Timeline range
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);

  // Processing & Progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [completedResult, setCompletedResult] = useState(null);
  const [cleanedVideoUrl, setCleanedVideoUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // View mode after completion: 'cleaned' | 'compare' | 'original'
  const [viewMode, setViewMode] = useState('cleaned');

  // Refs
  const videoRef = useRef(null);
  const cleanedVideoRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Switch Video Format (9:16 or 16:9) & update box geometry accordingly
  const handleFormatSelect = (fmt) => {
    if (isProcessing) return;
    setVideoFormat(fmt);
    const cfg = FORMAT_CONFIGS[fmt] || FORMAT_CONFIGS['9:16'];
    const vw = videoMeta?.width || (videoRef.current?.videoWidth) || cfg.refW;
    const vh = videoMeta?.height || (videoRef.current?.videoHeight) || cfg.refH;
    const geom = getVeoWatermarkGeometry(vw, vh, activePreset || 'bottom-right');
    setBox(geom.box);
  };

  // Handle Video Selection
  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (.mp4, .mov, .mkv, .webm).');
      return;
    }

    setErrorMsg(null);
    setCompletedResult(null);
    setCleanedVideoUrl(null);
    setProgressData(null);
    setVideoFile(file);

    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setLoadingMeta(true);

    try {
      const meta = await getVideoInfo(file);
          setVideoMeta(meta);
    // Dynamically adjust watermark box preset to match exact video aspect ratio
    if (meta.width && meta.height) {
      const isLandscape = meta.width > meta.height;
      const detectedFmt = isLandscape ? '16:9' : '9:16';
      setVideoFormat(detectedFmt);
      const geom = getVeoWatermarkGeometry(meta.width, meta.height, 'bottom-right');
      setBox(geom.box);
      setActivePreset('bottom-right');
    }
      setDuration(meta.duration || 0);
      setEndSec(meta.duration || 0);
      setStartSec(0);
    } catch (err) {
      console.warn('[VideoStudio] Metadata extraction fallback:', err);
    } finally {
      setLoadingMeta(false);
    }
  };

  // Video metadata loaded via native HTML5 element
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (!endSec || endSec === 0) setEndSec(dur);
    }
  };


  // Client-Side 0ms Live Frame Mathematical Unblending (with Fallback & Video Decoder sync)
  const [firstFrameImg, setFirstFrameImg] = useState(null);

  // Pre-cache first_frame_preview as an Image whenever videoMeta changes
  useEffect(() => {
    if (videoMeta?.first_frame_preview) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setFirstFrameImg(img);
      };
      img.src = videoMeta.first_frame_preview;
    }
  }, [videoMeta?.first_frame_preview]);

  const updateLivePreview = useCallback(() => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const vid = videoRef.current;
    let sourceElement = null;
    const cfg = FORMAT_CONFIGS[videoFormat] || FORMAT_CONFIGS['9:16'];
    let vw = videoMeta?.width || cfg.refW;
    let vh = videoMeta?.height || cfg.refH;

    if (vid && vid.readyState >= 2 && vid.videoWidth > 0 && vid.videoHeight > 0) {
      sourceElement = vid;
      vw = vid.videoWidth;
      vh = vid.videoHeight;
    } else if (firstFrameImg && firstFrameImg.complete && firstFrameImg.naturalWidth > 0) {
      sourceElement = firstFrameImg;
      vw = firstFrameImg.naturalWidth;
      vh = firstFrameImg.naturalHeight;
    } else if (vid && vid.videoWidth > 0) {
      sourceElement = vid;
      vw = vid.videoWidth;
      vh = vid.videoHeight;
    }

    if (!sourceElement) return;

    // Exact mathematical watermark geometry
    const geom = getVeoWatermarkGeometry(vw, vh, activePreset);
    let starX = geom.star.x;
    let starY = geom.star.y;
    let starSize = geom.star.size;

    if (activePreset === 'custom') {
      const boxCenterPxX = Math.round((box.x + box.w / 2) * vw);
      const boxCenterPxY = Math.round((box.y + box.h / 2) * vh);
      starX = Math.max(0, Math.min(vw - starSize, boxCenterPxX - Math.round(starSize / 2)));
      starY = Math.max(0, Math.min(vh - starSize, boxCenterPxY - Math.round(starSize / 2)));
    }

    // Crop around star with 28px padding
    const pad = 28;
    const cropX = Math.max(0, starX - pad);
    const cropY = Math.max(0, starY - pad);
    const cropW = Math.min(vw - cropX, starSize + pad * 2);
    const cropH = Math.min(vh - cropY, starSize + pad * 2);

    if (cropW <= 0 || cropH <= 0) return;

    canvas.width = cropW;
    canvas.height = cropH;

    try {
      ctx.drawImage(sourceElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      if (showLivePreview) {
        const imgData = ctx.getImageData(0, 0, cropW, cropH);
        const starXInCrop = starX - cropX;
        const starYInCrop = starY - cropY;
        unblendCropImageData(imgData, cropW, cropH, starXInCrop, starYInCrop, starSize, sliderGain);
        ctx.putImageData(imgData, 0, 0);
      }
    } catch (e) {
      console.warn("Live preview draw error:", e);
    }
  }, [box, activePreset, sliderGain, showLivePreview, firstFrameImg, videoMeta, videoFormat]);

  useEffect(() => {
    updateLivePreview();
  }, [updateLivePreview, currentTime, box, activePreset, sliderGain, showLivePreview, firstFrameImg]);

  const handleSelectPreset = (presetKey) => {
    if (isProcessing) return;
    setActivePreset(presetKey);
    const cfg = FORMAT_CONFIGS[videoFormat] || FORMAT_CONFIGS['9:16'];
    const vw = videoMeta?.width || (videoRef.current?.videoWidth) || cfg.refW;
    const vh = videoMeta?.height || (videoRef.current?.videoHeight) || cfg.refH;
    const geom = getVeoWatermarkGeometry(vw, vh, presetKey);
    setBox(geom.box);
  };

  // Video Time Update Listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (cleanedVideoRef.current && Math.abs(cleanedVideoRef.current.currentTime - videoRef.current.currentTime) > 0.3) {
        cleanedVideoRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  // Play / Pause Toggle (Synchronized for both players if comparing)
  const togglePlay = () => {
    if (isProcessing) return;
    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      if (cleanedVideoRef.current) cleanedVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current) videoRef.current.play();
      if (cleanedVideoRef.current) cleanedVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Step 1 Frame Forward / Backward
  const stepFrame = (frames) => {
    if (isProcessing) return;
    if (videoRef.current) videoRef.current.pause();
    if (cleanedVideoRef.current) cleanedVideoRef.current.pause();
    setIsPlaying(false);
    const fps = videoMeta?.fps || 30;
    const newTime = Math.max(0, Math.min(duration, (videoRef.current?.currentTime || 0) + (frames / fps)));
    if (videoRef.current) videoRef.current.currentTime = newTime;
    if (cleanedVideoRef.current) cleanedVideoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format Seconds to MM:SS.ms
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00.0';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Mouse Handlers for Dragging & Resizing the Watermark Box
  const handleBoxMouseDown = (e, handle = null) => {
    if (isProcessing) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (handle) {
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }

    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialBox({ ...box });
    setActivePreset('custom');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if ((!isDragging && !resizeHandle) || !dragStartPos || !initialBox || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragStartPos.x) / rect.width;
      const dy = (e.clientY - dragStartPos.y) / rect.height;

      if (isDragging) {
        // Move box without resizing
        const newX = Math.max(0, Math.min(1 - initialBox.w, initialBox.x + dx));
        const newY = Math.max(0, Math.min(1 - initialBox.h, initialBox.y + dy));
        setBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (resizeHandle) {
        // Resize box based on handle
        let newX = initialBox.x;
        let newY = initialBox.y;
        let newW = initialBox.w;
        let newH = initialBox.h;

        const minW = 0.04;
        const minH = 0.03;

        if (resizeHandle.includes('e')) {
          newW = Math.max(minW, Math.min(1 - initialBox.x, initialBox.w + dx));
        }
        if (resizeHandle.includes('s')) {
          newH = Math.max(minH, Math.min(1 - initialBox.y, initialBox.h + dy));
        }
        if (resizeHandle.includes('w')) {
          const maxDx = initialBox.w - minW;
          const clampedDx = Math.max(-initialBox.x, Math.min(maxDx, dx));
          newX = initialBox.x + clampedDx;
          newW = initialBox.w - clampedDx;
        }
        if (resizeHandle.includes('n')) {
          const maxDy = initialBox.h - minH;
          const clampedDy = Math.max(-initialBox.y, Math.min(maxDy, dy));
          newY = initialBox.y + clampedDy;
          newH = initialBox.h - clampedDy;
        }

        setBox({ x: newX, y: newY, w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeHandle(null);
      setDragStartPos(null);
      setInitialBox(null);
    };

    if (isDragging || resizeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizeHandle, dragStartPos, initialBox]);

  // Start Real-Time Video Watermark Removal Pipeline
  const handleStartProcessing = async () => {
    if (!videoFile || isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setProgressData({ status: 'starting', progress: 0.0, frame: 0, total_frames: videoMeta?.frame_count || 100 });

    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    try {
      await cleanVideoStream({
        videoFile,
        removalMode,
        unblendGain: parseFloat(sliderGain) || 0.28,  // AUTO
        sizeScale: 1.0,
        boxX: box.x,
        boxY: box.y,
        boxW: box.w,
        boxH: box.h,
        startSec: parseFloat(startSec) || 0,
        endSec: parseFloat(endSec) || duration,
        onProgress: (evt) => {
          setProgressData(evt);
        },
        onComplete: (evt) => {
          setIsProcessing(false);
          setCompletedResult(evt);
          if (evt.video_id) {
            setCleanedVideoUrl(getVideoStreamUrl(evt.video_id));
          }
        },
        onError: (err) => {
          setIsProcessing(false);
          setErrorMsg(err.message || 'An error occurred during video processing.');
        },
      });
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to connect to video removal engine.');
    }
  };

  // Reset Everything
  const handleReset = () => {
    if (isProcessing) return;
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setCompletedResult(null);
    setCleanedVideoUrl(null);
    setProgressData(null);
    setIsProcessing(false);
    setErrorMsg(null);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#07050f',
      color: '#fff',
      paddingTop: '84px',
      paddingBottom: '40px',
      paddingLeft: '24px',
      paddingRight: '24px',
      position: 'relative',
    }}>
      {/* Top Header Toolbar */}
      <div style={{
        maxWidth: 1400, margin: '0 auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
        background: 'rgba(15, 12, 32, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '12px 20px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25))',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
          }}>
            <Film size={19} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em', color: '#fff' }}>
              CleanMark Video Studio
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Mathematical Alpha Unblending — Instant, Zero Blur
            </div>
          </div>
        </div>

        {/* Engine Switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(0, 0, 0, 0.45)', padding: 4, borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setRemovalMode('unblend')}
            disabled={isProcessing}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: removalMode === 'unblend' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
              color: removalMode === 'unblend' ? '#fff' : '#9ca3af',
              fontSize: 12, fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Zap size={13} color={removalMode === 'unblend' ? '#38bdf8' : '#9ca3af'} />
            <span>⚡ Gemini / Veo Math Unblend (Zero Blur)</span>
          </button>
        </div>

        {/* Video Format Quick-Switch Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(0, 0, 0, 0.45)', padding: 4, borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => handleFormatSelect('9:16')}
            disabled={isProcessing}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none',
              background: videoFormat === '9:16' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(99, 102, 241, 0.35))' : 'transparent',
              color: videoFormat === '9:16' ? '#38bdf8' : '#9ca3af',
              fontSize: 12, fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: videoFormat === '9:16' ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Smartphone size={13} color={videoFormat === '9:16' ? '#38bdf8' : '#9ca3af'} />
            <span>9:16 Portrait</span>
          </button>
          <button
            onClick={() => handleFormatSelect('16:9')}
            disabled={isProcessing}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none',
              background: videoFormat === '16:9' ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.35), rgba(99, 102, 241, 0.35))' : 'transparent',
              color: videoFormat === '16:9' ? '#a78bfa' : '#9ca3af',
              fontSize: 12, fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: videoFormat === '16:9' ? '0 0 12px rgba(167, 139, 250, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Monitor size={13} color={videoFormat === '16:9' ? '#a78bfa' : '#9ca3af'} />
            <span>16:9 Landscape</span>
          </button>
        </div>

        {videoFile && (
          <button
            onClick={handleReset}
            disabled={isProcessing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10,
              background: isProcessing ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: isProcessing ? '#4b5563' : '#e2e8f0',
              fontSize: 12.5, fontWeight: 600,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <RotateCcw size={13} />
            <span>Load Different Video</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* 1. Empty Dropzone State */}
        {!videoFile && (
          <div style={{
            maxWidth: 720, margin: '40px auto',
            padding: '48px 32px', borderRadius: 24,
            background: 'rgba(15, 12, 32, 0.8)',
            border: '2px dashed rgba(99, 102, 241, 0.35)',
            textAlign: 'center', backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.15))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)',
            }}>
              <UploadCloud size={34} color="#38bdf8" />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
              Drop Your Video Here
            </h2>
            <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 480, margin: '0 auto 18px', lineHeight: 1.5 }}>
              Instant mathematical unblending for Google Gemini &amp; Veo 3 watermarks.
            </p>

            {/* Prominent Format Selector on Dropzone */}
            <div style={{ marginBottom: 26 }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 12
              }}>
                1. Select Target Video Format
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 460, margin: '0 auto' }}>
                {/* 9:16 Portrait Card */}
                <div
                  onClick={() => handleFormatSelect('9:16')}
                  style={{
                    padding: '16px 14px', borderRadius: 16, cursor: 'pointer',
                    background: videoFormat === '9:16'
                      ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(99, 102, 241, 0.18))'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: videoFormat === '9:16'
                      ? '2px solid #38bdf8'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: videoFormat === '9:16' ? '0 0 24px rgba(56, 189, 248, 0.3)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: videoFormat === '9:16' ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{
                    width: 32, height: 48, borderRadius: 6,
                    border: `2px solid ${videoFormat === '9:16' ? '#38bdf8' : '#64748b'}`,
                    background: videoFormat === '9:16' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Smartphone size={16} color={videoFormat === '9:16' ? '#38bdf8' : '#94a3b8'} />
                    {videoFormat === '9:16' && (
                      <div style={{
                        position: 'absolute', top: -6, right: -6, width: 16, height: 16,
                        borderRadius: '50%', background: '#38bdf8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 8px #38bdf8'
                      }}>
                        <Check size={10} color="#000" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: videoFormat === '9:16' ? '#38bdf8' : '#e2e8f0' }}>
                      9:16 Portrait
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      Shorts, Reels, TikTok
                    </div>
                  </div>
                </div>

                {/* 16:9 Landscape Card */}
                <div
                  onClick={() => handleFormatSelect('16:9')}
                  style={{
                    padding: '16px 14px', borderRadius: 16, cursor: 'pointer',
                    background: videoFormat === '16:9'
                      ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.22), rgba(99, 102, 241, 0.18))'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: videoFormat === '16:9'
                      ? '2px solid #a78bfa'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: videoFormat === '16:9' ? '0 0 24px rgba(167, 139, 250, 0.3)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: videoFormat === '16:9' ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{
                    width: 48, height: 32, borderRadius: 6,
                    border: `2px solid ${videoFormat === '16:9' ? '#a78bfa' : '#64748b'}`,
                    background: videoFormat === '16:9' ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Monitor size={16} color={videoFormat === '16:9' ? '#a78bfa' : '#94a3b8'} />
                    {videoFormat === '16:9' && (
                      <div style={{
                        position: 'absolute', top: -6, right: -6, width: 16, height: 16,
                        borderRadius: '50%', background: '#a78bfa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 8px #a78bfa'
                      }}>
                        <Check size={10} color="#000" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: videoFormat === '16:9' ? '#a78bfa' : '#e2e8f0' }}>
                      16:9 Landscape
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      YouTube, Cinema, Standard
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                ✦ Pre-calibrates the mathematical watermark detector to exact aspect ratio coordinates.
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/avi"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              style={{
                padding: '13px 28px', fontSize: 14, fontWeight: 700, borderRadius: 12,
                display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              }}
            >
              <Video size={16} />
              <span>Browse Video File</span>
            </button>

            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 16 }}>
              Supports MP4, MOV, MKV, WebM • 100% Private Local Processing
            </div>
          </div>
        )}

        {/* 2. Interactive Video Studio Workspace */}
        {videoFile && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: completedResult ? '1fr' : '1fr 340px',
            gap: 20,
            alignItems: 'start',
          }}>

            {/* Video Player Section (When editing / processing) */}
            {!completedResult ? (
              <div style={{
                background: 'rgba(15, 12, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20, padding: 18,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
              }}>

                {/* Title & Timecode */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12, fontSize: 13, color: '#9ca3af'
                }}>
                  <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Film size={14} color="#818cf8" />
                    {videoFile.name}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Video Player + Draggable/Resizable Watermark Box Overlay */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#000',
                    height: '62vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Aspect-Ratio-Preserving Inner Wrapper */}
                  <div
                    ref={containerRef}
                    style={{
                      position: 'relative',
                      height: '100%',
                      aspectRatio: videoMeta ? `${videoMeta.width}/${videoMeta.height}` : '16/9',
                      maxWidth: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* HTML5 Video Element */}
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 14,
                        display: 'block',
                      }}
                      onLoadedMetadata={(e) => {
                        handleLoadedMetadata(e);
                        // Nudge currentTime slightly to kick hardware decoder on first frame
                        if (e.target.currentTime === 0) {
                          e.target.currentTime = 0.001;
                        }
                        updateLivePreview();
                      }}
                      onLoadedData={updateLivePreview}
                      onCanPlay={updateLivePreview}
                      onSeeked={updateLivePreview}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      playsInline
                    />

                    {/* Interactive Clean Light-Blue Watermark Box */}
                    <div
                      onMouseDown={(e) => handleBoxMouseDown(e, null)}
                      style={{
                        position: 'absolute',
                        left: `${box.x * 100}%`,
                        top: `${box.y * 100}%`,
                        width: `${box.w * 100}%`,
                        height: `${box.h * 100}%`,
                        background: 'rgba(56, 189, 248, 0.22)',
                        border: '2px dashed #38bdf8',
                        boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
                        borderRadius: 6,
                        cursor: isProcessing ? 'not-allowed' : 'move',
                        pointerEvents: isProcessing ? 'none' : 'auto',
                        userSelect: 'none',
                        zIndex: 10,
                        backdropFilter: 'blur(1px)',
                        transition: isDragging || resizeHandle ? 'none' : 'all 0.15s ease-out',
                      }}
                    >
                      {/* 4 Corner Resize Handles */}
                      {!isProcessing && (
                        <>
                          <div
                            onMouseDown={(e) => handleBoxMouseDown(e, 'nw')}
                            style={{
                              position: 'absolute', top: -5, left: -5,
                              width: 10, height: 10, background: '#fff',
                              border: '2px solid #38bdf8', borderRadius: 2,
                              boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)',
                              cursor: 'nwse-resize', zIndex: 12
                            }}
                          />
                          <div
                            onMouseDown={(e) => handleBoxMouseDown(e, 'ne')}
                            style={{
                              position: 'absolute', top: -5, right: -5,
                              width: 10, height: 10, background: '#fff',
                              border: '2px solid #38bdf8', borderRadius: 2,
                              boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)',
                              cursor: 'nesw-resize', zIndex: 12
                            }}
                          />
                          <div
                            onMouseDown={(e) => handleBoxMouseDown(e, 'sw')}
                            style={{
                              position: 'absolute', bottom: -5, left: -5,
                              width: 10, height: 10, background: '#fff',
                              border: '2px solid #38bdf8', borderRadius: 2,
                              boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)',
                              cursor: 'nesw-resize', zIndex: 12
                            }}
                          />
                          <div
                            onMouseDown={(e) => handleBoxMouseDown(e, 'se')}
                            style={{
                              position: 'absolute', bottom: -5, right: -5,
                              width: 10, height: 10, background: '#fff',
                              border: '2px solid #38bdf8', borderRadius: 2,
                              boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)',
                              cursor: 'nwse-resize', zIndex: 12
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video Playback Controls & Frame Stepper */}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Scrub Bar */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.01"
                    disabled={isProcessing}
                    value={currentTime}
                    onChange={(e) => {
                      if (isProcessing) return;
                      const t = parseFloat(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.currentTime = t;
                        setCurrentTime(t);
                      }
                    }}
                    style={{
                      width: '100%', height: 6, borderRadius: 3,
                      accentColor: isProcessing ? '#4b5563' : '#38bdf8',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.4 : 1,
                    }}
                  />

                  {/* Button Controls */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={togglePlay}
                        disabled={isProcessing}
                        style={{
                          padding: '8px 16px', borderRadius: 10,
                          background: isProcessing ? 'rgba(56, 189, 248, 0.2)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                          border: 'none', color: isProcessing ? '#6b7280' : '#fff',
                          fontSize: 12.5, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 6,
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          opacity: isProcessing ? 0.5 : 1,
                        }}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>


                    </div>

                    {videoMeta && (
                      <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                        {videoMeta.width}×{videoMeta.height} • {videoMeta.fps} FPS • {videoMeta.frame_count} frames
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Output Cleaned Video: Full-Resolution Display with View Modes */
              <div style={{
                background: 'rgba(15, 12, 32, 0.85)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 20, padding: 22,
                backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column', gap: 18,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              }}>
                {/* Result Header & View Mode Switcher */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontSize: 16, fontWeight: 800 }}>
                    <CheckCircle2 size={20} />
                    <span>Cleaned Video Successfully Rendered!</span>
                  </div>

                  {/* View Mode Buttons */}
                  <div style={{
                    display: 'flex', gap: 4,
                    background: 'rgba(0,0,0,0.4)', padding: 4, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <button
                      onClick={() => setViewMode('cleaned')}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: viewMode === 'cleaned' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                        color: viewMode === 'cleaned' ? '#34d399' : '#9ca3af',
                        fontSize: 12, fontWeight: viewMode === 'cleaned' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      ✨ Cleaned View
                    </button>
                    <button
                      onClick={() => setViewMode('compare')}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: viewMode === 'compare' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                        color: viewMode === 'compare' ? '#38bdf8' : '#9ca3af',
                        fontSize: 12, fontWeight: viewMode === 'compare' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      ↔️ Side-by-Side Compare
                    </button>
                    <button
                      onClick={() => setViewMode('original')}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: viewMode === 'original' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        color: viewMode === 'original' ? '#fff' : '#9ca3af',
                        fontSize: 12, fontWeight: viewMode === 'original' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      👁️ Original
                    </button>
                  </div>
                </div>

                {/* Video Playback Display (Full Aspect Ratio with ZERO Crop) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'compare' ? '1fr 1fr' : '1fr',
                  gap: 16,
                  alignItems: 'center',
                }}>
                  {/* Original Video (shown in compare or original mode) */}
                  {(viewMode === 'compare' || viewMode === 'original') && (
                    <div style={{
                      background: '#000', borderRadius: 14, overflow: 'hidden',
                      height: '62vh', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.08)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute', top: 10, left: 10, zIndex: 10,
                        background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, color: '#f87171'
                      }}>
                        Original (With Watermark)
                      </div>
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls={viewMode === 'original'}
                        style={{
                          height: '100%',
                          aspectRatio: videoMeta ? `${videoMeta.width}/${videoMeta.height}` : 'auto',
                          objectFit: 'contain',
                          maxWidth: '100%',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}

                  {/* Cleaned Video (shown in compare or cleaned mode) */}
                  {(viewMode === 'compare' || viewMode === 'cleaned') && (
                    <div style={{
                      background: '#000', borderRadius: 14, overflow: 'hidden',
                      height: '62vh', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute', top: 10, left: 10, zIndex: 10,
                        background: 'rgba(16, 185, 129, 0.85)', padding: '4px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, color: '#fff'
                      }}>
                        Cleaned with CleanMark AI
                      </div>
                      <video
                        ref={cleanedVideoRef}
                        src={cleanedVideoUrl}
                        controls
                        autoPlay
                        loop
                        style={{
                          height: '100%',
                          aspectRatio: videoMeta ? `${videoMeta.width}/${videoMeta.height}` : 'auto',
                          objectFit: 'contain',
                          maxWidth: '100%',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12, marginTop: 8,
                  paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Engine: <strong style={{ color: '#38bdf8' }}>{completedResult.removal_mode === 'inpaint' ? 'AI Inpainting' : '⚡ Math Unblend (Zero Blur)'}</strong> • Output: <strong style={{ color: '#34d399' }}>H.264 MP4 ({completedResult.elapsed_seconds || 1.2}s)</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => {
                        setCompletedResult(null);
                        setCleanedVideoUrl(null);
                      }}
                      style={{
                        padding: '12px 18px', borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#cbd5e1', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Adjust Settings &amp; Process Again
                    </button>

                    {/* Download Button */}
                    <a
                      href={getVideoDownloadUrl(completedResult.video_id)}
                      download={`cleanmark_${completedResult.video_id?.slice(0, 8)}.mp4`}
                      className="btn-primary"
                      style={{
                        padding: '12px 24px', borderRadius: 10,
                        fontSize: 13.5, fontWeight: 800,
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <Download size={16} />
                      <span>Download Cleaned Video (.mp4)</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Right Sidebar: Watermark Presets & Controls (Only while not completed) */}
            {!completedResult && (
              <div style={{
                background: 'rgba(15, 12, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20, padding: 20,
                backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column', gap: 18,
                position: 'relative',
              }}>

                {/* Section 1: Watermark Preset Selection */}
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#e2e0f0',
                    marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sliders size={15} color="#38bdf8" />
                      <span>Watermark Preset Position</span>
                    </span>
                    <span style={{ fontSize: 10.5, color: '#38bdf8', fontWeight: 600 }}>
                      ✨ Move &amp; Resize
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { id: 'bottom-right', label: 'Bottom-Right (Veo)' },
                      { id: 'bottom-left', label: 'Bottom-Left' },
                      { id: 'top-right', label: 'Top-Right' },
                      { id: 'top-left', label: 'Top-Left' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        disabled={isProcessing}
                        onClick={() => handleSelectPreset(pos.id)}
                        style={{
                          padding: '10px', borderRadius: 10,
                          background: activePreset === pos.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${activePreset === pos.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: isProcessing ? '#4b5563' : activePreset === pos.id ? '#38bdf8' : '#9ca3af',
                          fontSize: 12, fontWeight: 600,
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          opacity: isProcessing ? 0.5 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleSelectPreset('bottom-banner')}
                    style={{
                      width: '100%', marginTop: 8, padding: '10px', borderRadius: 10,
                      background: activePreset === 'bottom-banner' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${activePreset === 'bottom-banner' ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isProcessing ? '#4b5563' : activePreset === 'bottom-banner' ? '#38bdf8' : '#9ca3af',
                      fontSize: 12, fontWeight: 600,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.5 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Bottom Subtitle Banner
                  </button>

                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, lineHeight: 1.4 }}>
                    💡 <strong style={{ color: '#e2e0f0' }}>Tip:</strong> Drag the light blue box or handles directly on the video.
                  </div>
                </div>


                
                {/* Section 2: Real-Time Live Frame Preview & Removal Strength Slider */}
                <div style={{
                  padding: '14px', borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08))',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Eye size={15} />
                      <span>Live Frame Preview (0ms Lag)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(!showLivePreview)}
                      style={{
                        padding: '3px 8px', borderRadius: 6,
                        background: showLivePreview ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${showLivePreview ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                        color: showLivePreview ? '#38bdf8' : '#9ca3af',
                        fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {showLivePreview ? <Sparkles size={11} /> : <EyeOff size={11} />}
                      <span>{showLivePreview ? 'Preview: Cleaned' : 'Preview: Original'}</span>
                    </button>
                  </div>

                  {/* Zoomed Live ROI Canvas */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: 'rgba(0,0,0,0.4)', borderRadius: 10,
                    padding: '8px', border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <canvas
                      ref={previewCanvasRef}
                      style={{
                        maxWidth: '100%', maxHeight: 120,
                        borderRadius: 6, imageRendering: 'pixelated',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                    />
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, display: 'flex', gap: 8 }}>
                      <span>Frame @ {currentTime.toFixed(2)}s</span>
                      <span>•</span>
                      <span style={{ color: showLivePreview ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {showLivePreview ? '✓ Math Unblended' : 'Original Frame'}
                      </span>
                    </div>
                  </div>

                  {/* Strength Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1', marginBottom: 5 }}>
                      <span style={{ fontWeight: 600 }}>Removal Strength (Opacity)</span>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                        {sliderGain.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range" min="0.10" max="0.60" step="0.01"
                      disabled={isProcessing}
                      value={sliderGain}
                      onChange={(e) => setSliderGain(parseFloat(e.target.value))}
                      style={{
                        width: '100%', accentColor: '#38bdf8',
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#64748b', marginTop: 2 }}>
                      <span>0.10 (Light)</span>
                      <span style={{ color: '#38bdf8' }}>0.32 (Optimal Range: 0.25 - 0.45)</span>
                      <span>0.60 (Strong)</span>
                    </div>
                  </div>

                  {/* Quick Preset Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                    {[
                      { label: 'Subtle', val: 0.24 },
                      { label: 'Standard', val: 0.32 },
                      { label: 'Medium', val: 0.40 },
                      { label: 'Strong', val: 0.48 }
                    ].map((pill) => (
                      <button
                        key={pill.label}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setSliderGain(pill.val)}
                        style={{
                          padding: '4px 2px', borderRadius: 6,
                          background: Math.abs(sliderGain - pill.val) < 0.02 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${Math.abs(sliderGain - pill.val) < 0.02 ? '#38bdf8' : 'rgba(255,255,255,0.06)'}`,
                          color: Math.abs(sliderGain - pill.val) < 0.02 ? '#38bdf8' : '#94a3b8',
                          fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                        }}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3: Timeline Range */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e0f0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} color="#38bdf8" />
                    <span>Timeline Range</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>From (sec)</div>
                      <input
                        type="number" step="0.5" min="0" max={duration}
                        disabled={isProcessing}
                        value={startSec} onChange={(e) => setStartSec(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: isProcessing ? '#6b7280' : '#fff',
                          fontSize: 12, outline: 'none',
                          cursor: isProcessing ? 'not-allowed' : 'auto',
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>To (sec)</div>
                      <input
                        type="number" step="0.5" min="0" max={duration}
                        disabled={isProcessing}
                        value={endSec} onChange={(e) => setEndSec(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: isProcessing ? '#6b7280' : '#fff',
                          fontSize: 12, outline: 'none',
                          cursor: isProcessing ? 'not-allowed' : 'auto',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Processing Indicator & Progress Bar */}
                {isProcessing && progressData && (
                  <div style={{
                    padding: '14px', borderRadius: 14,
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={12} color="#38bdf8" />
                        <span>Processing Video...</span>
                      </span>
                      <span>{progressData.progress || 0}%</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{
                        width: `${progressData.progress || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                        transition: 'width 0.15s ease',
                      }} />
                    </div>

                    <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Frame {progressData.frame || 0} of {progressData.total_frames || videoMeta?.frame_count || 0}</span>
                      {progressData.fps_processing && (
                        <span>{progressData.fps_processing} FPS • {progressData.eta_seconds}s ETA</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMsg && (
                  <div style={{
                    padding: '12px', borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <AlertCircle size={15} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={handleStartProcessing}
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    padding: '14px', borderRadius: 12,
                    fontSize: 14, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    background: removalMode === 'unblend'
                      ? 'linear-gradient(135deg, #0284c7, #059669)'
                      : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: isProcessing ? 'none' : '0 4px 20px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Processing Video ({progressData?.progress || 0}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{removalMode === 'unblend' ? '⚡ Instant Clean Video (Zero Blur)' : '🧠 AI Clean Video (Inpaint)'}</span>
                    </>
                  )}
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
