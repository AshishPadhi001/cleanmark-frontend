import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Paintbrush, RotateCcw, RotateCw,
  Download, Trash2, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  Sliders, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Sparkles, RefreshCw,
  Hand, RotateCcw as ResetIcon, Plus, Layers, Check, ShieldCheck, FileArchive, X,
  Play, Minus, Eye as ViewIcon, Split, Clock, Lock, Keyboard, CornerDownRight,
  Crosshair, HelpCircle, Square, Move, BoxSelect, Eraser, Expand, Image as ImageIcon
} from 'lucide-react';
import JSZip from 'jszip';
import { inpaintImage, inpaintBatch } from '../config/api';

/* ─── Helpers ─── */
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const generateSessionId = () => 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now();

/**
 * Deep Purge: Wipes sessionStorage, localStorage, and revokes all active blob URLs
 */
function purgeClientStorage(items = []) {
  try {
    sessionStorage.clear();
    localStorage.clear();
    if (Array.isArray(items)) {
      items.forEach((it) => {
        if (it?.srcUrl?.startsWith('blob:')) URL.revokeObjectURL(it.srcUrl);
        if (it?.resultUrl?.startsWith('blob:')) URL.revokeObjectURL(it.resultUrl);
      });
    }
    console.log('%c[CleanMark Security] All temporary session storage, cache & memory URLs purged.', 'color: #10b981; font-weight: bold;');
  } catch (err) {
    console.warn('[CleanMark Security] Storage purge error:', err);
  }
}

/* ─── 1. Multi-Image Batch Uploader (1 to 5 Images) ─── */
function MultiUploader({ onFilesSelected }) {
  const [drag, setDrag] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = async (fileList) => {
    setErrorMsg(null);
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setErrorMsg('Please select valid image files (PNG, JPG, WEBP).');
      return;
    }

    let combined = [...stagedFiles, ...valid];
    if (combined.length > 5) {
      setErrorMsg('Maximum 5 images per batch. Extra images were ignored.');
      combined = combined.slice(0, 5);
    }

    setStagedFiles(combined);
  };

  const removeStaged = (idx) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const startBatch = async () => {
    if (stagedFiles.length === 0) return;
    const items = await Promise.all(
      stagedFiles.map(async (f, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        file: f,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        srcUrl: await readFileAsDataUrl(f),
        maskCanvas: null,
        activeBoxes: [],
        hasMask: false,
        status: 'pending',
        resultUrl: null,
        error: null,
        timingInfo: null,
      }))
    );
    onFilesSelected(items);
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        
        {/* Drag & Drop Zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          style={{
            border: `2px dashed ${drag ? '#818cf8' : 'rgba(255,255,255,0.14)'}`,
            borderRadius: 24,
            padding: stagedFiles.length > 0 ? '36px 32px' : '64px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            background: drag ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(16px)',
            boxShadow: drag ? '0 0 36px rgba(99,102,241,0.25)' : '0 16px 40px rgba(0,0,0,0.3)',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
            border: '1px solid rgba(99,102,241,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          }}>
            <Layers size={32} color="#a5b4fc" />
          </div>

          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>
            Drop 1 to 5 Images Here
          </div>
          <p style={{ fontSize: 13.5, color: '#9ca3af', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Select up to <strong>5 images</strong> to remove watermarks simultaneously. 90%+ AI accuracy with instant local inpainting.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            <Plus size={16} color="#818cf8" /> Choose Images (1 – 5)
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>

        {errorMsg && (
          <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} /> {errorMsg}
          </div>
        )}

        {/* Staged Images Preview List */}
        {stagedFiles.length > 0 && (
          <div style={{ marginTop: 24, background: 'rgba(15, 12, 32, 0.85)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: '20px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e0f0' }}>
                Selected Images ({stagedFiles.length}/5)
              </span>
              <button
                onClick={() => setStagedFiles([])}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
              {stagedFiles.map((file, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', aspectRatio: '1/1' }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 4, left: 4, padding: '2px 6px', borderRadius: 6, background: 'rgba(0,0,0,0.75)', fontSize: 10, fontWeight: 700, color: '#818cf8' }}>
                    #{idx + 1}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeStaged(idx); }}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Remove from batch"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={startBatch}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 700, justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
            >
              <Sparkles size={16} /> Open Batch Studio ({stagedFiles.length} {stagedFiles.length === 1 ? 'Image' : 'Images'})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 2. Unified Studio Workspace ─── */
function UnifiedStudioPanel({
  items,
  activeIndex,
  setActiveIndex,
  onUpdateItemMask,
  onProcessSingleImage,
  onProcessAllParallel,
  onResetBatch,
  onRemoveItemFromBatch,
  onDownloadSingle,
  onDownloadAllZip,
  isZipping,
  zipProgress,
}) {
  const currentItem = items[activeIndex] || items[0];

  // View state for active image: 'paint' | 'compare'
  const [viewMode, setViewMode] = useState('paint');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Canvas Refs & Dimensions
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const imgRef = useRef(null);
  const [imgDims, setImgDims] = useState({ w: 1000, h: 1000 });

  // Tools: 'box' | 'brush' | 'scroll'
  const [activeTool, setActiveTool] = useState('box');
  
  // Brush Mode: 'paint' (draw mask) | 'erase' (reverse / unmask)
  const [brushMode, setBrushMode] = useState('paint');
  const [brushSize, setBrushSize] = useState(65);
  const [dilation, setDilation] = useState(4);
  const [showMask, setShowMask] = useState(true);

  // Interactive Resizable & Movable Transform Boxes State
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [transformInteraction, setTransformInteraction] = useState(null);

  // Stable Zoom & Pan System (Zero accidental jumping)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Freehand Brush State
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false, screenRadius: 32 });
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);

  // Undo / Redo History
  const historyStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Comparison View Mode: 'pip' (Picture-in-Picture Hover Preview) vs 'split' (Slider)
  const [compareStyle, setCompareStyle] = useState('pip'); // 'pip' | 'split'
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [showOriginalBig, setShowOriginalBig] = useState(false); // Triggered on PIP hover or hold
  const sliderContainerRef = useRef(null);

  const isScrollMode = activeTool === 'scroll' || spacePressed;

  // Selected Box Reference
  const selectedBox = boxes.find((b) => b.id === selectedBoxId) || (boxes.length > 0 ? boxes[boxes.length - 1] : null);

  useEffect(() => {
    if (currentItem?.status === 'done' && currentItem?.resultUrl) {
      setViewMode('compare');
    } else {
      setViewMode('paint');
    }
  }, [activeIndex, currentItem?.status, currentItem?.resultUrl]);

  // Redraw Canvas with both Freehand Mask & Dynamic Boxes
  const renderAll = useCallback(() => {
    const c = canvasRef.current;
    const m = maskRef.current;
    const img = imgRef.current;
    if (!c || !m || !img) return;

    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);

    if (showMask) {
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.drawImage(m, 0, 0, c.width, c.height);

      // Render active boxes onto canvas preview
      boxes.forEach((b) => {
        ctx.fillStyle = '#818cf8';
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      ctx.restore();
    }
  }, [showMask, boxes]);

  // Push Snapshot to History Stack
  const pushHistory = useCallback((customBoxes = null) => {
    const m = maskRef.current;
    if (!m) return;
    const ctx = m.getContext('2d');
    const maskData = ctx.getImageData(0, 0, m.width, m.height);
    const boxState = customBoxes !== null ? customBoxes : JSON.parse(JSON.stringify(boxes));

    historyStack.current.push({
      maskData,
      boxes: boxState,
    });

    if (historyStack.current.length > 30) historyStack.current.shift();
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [boxes]);

  // Save current composited state to the item
  const saveCurrentMaskToItem = useCallback((currentBoxes = null) => {
    const activeB = currentBoxes !== null ? currentBoxes : boxes;
    const m = maskRef.current;
    if (!m) return;

    const ctx = m.getContext('2d');
    const rawMask = ctx.getImageData(0, 0, m.width, m.height);

    let hasPixels = false;
    for (let i = 3; i < rawMask.data.length; i += 4) {
      if (rawMask.data[i] > 10) { hasPixels = true; break; }
    }

    const hasAnyMask = hasPixels || (activeB && activeB.length > 0);
    onUpdateItemMask(activeIndex, rawMask, hasAnyMask, activeB);
  }, [activeIndex, boxes, onUpdateItemMask]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyStack.current.length === 0) return;
    const m = maskRef.current;
    if (!m) return;

    const ctx = m.getContext('2d');
    const currentSnapshot = {
      maskData: ctx.getImageData(0, 0, m.width, m.height),
      boxes: JSON.parse(JSON.stringify(boxes)),
    };
    redoStack.current.push(currentSnapshot);

    const prevSnapshot = historyStack.current.pop();
    ctx.putImageData(prevSnapshot.maskData, 0, 0);
    setBoxes(prevSnapshot.boxes);

    if (prevSnapshot.boxes.length > 0) {
      setSelectedBoxId(prevSnapshot.boxes[prevSnapshot.boxes.length - 1].id);
    } else {
      setSelectedBoxId(null);
    }

    setCanUndo(historyStack.current.length > 0);
    setCanRedo(true);
    saveCurrentMaskToItem(prevSnapshot.boxes);
    renderAll();
  }, [boxes, saveCurrentMaskToItem, renderAll]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const m = maskRef.current;
    if (!m) return;

    const ctx = m.getContext('2d');
    const currentSnapshot = {
      maskData: ctx.getImageData(0, 0, m.width, m.height),
      boxes: JSON.parse(JSON.stringify(boxes)),
    };
    historyStack.current.push(currentSnapshot);

    const nextSnapshot = redoStack.current.pop();
    ctx.putImageData(nextSnapshot.maskData, 0, 0);
    setBoxes(nextSnapshot.boxes);

    if (nextSnapshot.boxes.length > 0) {
      setSelectedBoxId(nextSnapshot.boxes[nextSnapshot.boxes.length - 1].id);
    } else {
      setSelectedBoxId(null);
    }

    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
    saveCurrentMaskToItem(nextSnapshot.boxes);
    renderAll();
  }, [boxes, saveCurrentMaskToItem, renderAll]);

  // Clear Entire Mask
  const clearMask = () => {
    const m = maskRef.current;
    if (!m) return;
    pushHistory();
    const ctx = m.getContext('2d');
    ctx.clearRect(0, 0, m.width, m.height);
    setBoxes([]);
    setSelectedBoxId(null);
    saveCurrentMaskToItem([]);
    renderAll();
  };

  // Preset Corner Watermark Trigger
  const applyOrToggleCornerBox = (corner) => {
    const { w: imgW, h: imgH } = imgDims;
    if (!imgW || !imgH) return;

    pushHistory();

    const defW = Math.max(80, Math.round(brushSize * 3.5));
    const defH = Math.max(50, Math.round(brushSize * 2.0));

    let rx = 20, ry = 20;
    if (corner === 'top-left') {
      rx = 20; ry = 20;
    } else if (corner === 'top-right') {
      rx = imgW - defW - 20; ry = 20;
    } else if (corner === 'bottom-left') {
      rx = 20; ry = imgH - defH - 20;
    } else if (corner === 'bottom-right') {
      rx = imgW - defW - 20; ry = imgH - defH - 20;
    }

    const existingIndex = boxes.findIndex((b) => b.corner === corner);

    let nextBoxes;
    if (existingIndex >= 0) {
      nextBoxes = boxes.filter((_, idx) => idx !== existingIndex);
      setSelectedBoxId(nextBoxes.length > 0 ? nextBoxes[0].id : null);
    } else {
      const newBox = {
        id: `box_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        corner,
        x: Math.max(0, rx),
        y: Math.max(0, ry),
        w: Math.min(imgW, defW),
        h: Math.min(imgH, defH),
      };
      nextBoxes = [...boxes, newBox];
      setSelectedBoxId(newBox.id);
      setActiveTool('box');
    }

    setBoxes(nextBoxes);
    saveCurrentMaskToItem(nextBoxes);
    renderAll();
  };

  // Update selected box properties directly via sliders
  const updateSelectedBox = (updates) => {
    const targetId = selectedBoxId || (boxes.length > 0 ? boxes[boxes.length - 1].id : null);
    if (!targetId) return;

    setBoxes((prev) => {
      const next = prev.map((b) => (b.id === targetId ? { ...b, ...updates } : b));
      saveCurrentMaskToItem(next);
      return next;
    });
  };

  const removeSelectedBox = () => {
    const targetId = selectedBoxId || (boxes.length > 0 ? boxes[boxes.length - 1].id : null);
    if (!targetId) return;
    pushHistory();
    const next = boxes.filter((b) => b.id !== targetId);
    setBoxes(next);
    setSelectedBoxId(next.length > 0 ? next[0].id : null);
    saveCurrentMaskToItem(next);
    renderAll();
  };

  // Load Active Image onto Canvas & Restore Mask + Boxes
  useEffect(() => {
    if (!currentItem) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      const c = canvasRef.current;
      const m = maskRef.current;
      if (c && m) {
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        m.width = img.naturalWidth;
        m.height = img.naturalHeight;

        const mCtx = m.getContext('2d');
        mCtx.clearRect(0, 0, m.width, m.height);

        if (currentItem.maskCanvas) {
          mCtx.putImageData(currentItem.maskCanvas, 0, 0);
        }
      }

      const existingBoxes = currentItem.activeBoxes || [];
      setBoxes(existingBoxes);
      setSelectedBoxId(existingBoxes.length > 0 ? existingBoxes[0].id : null);

      setZoom(1);
      setPan({ x: 0, y: 0 });
      historyStack.current = [];
      redoStack.current = [];
      setCanUndo(false);
      setCanRedo(false);
      renderAll();
    };
    img.src = currentItem.srcUrl;
  }, [activeIndex, currentItem, renderAll]);

  // Intentional Zoom ONLY (Triggered when holding Ctrl/Cmd or in Pan mode)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // Prevent accidental zoom unless Ctrl is held OR activeTool is scroll
      if (!e.ctrlKey && !e.metaKey && activeTool !== 'scroll') {
        return;
      }
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((z) => Math.min(4, Math.max(0.4, +(z * factor).toFixed(2))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeTool]);

  const getCanvasCoords = (e) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const updateCursor = (e) => {
    const c = canvasRef.current;
    if (!c) {
      setCursorPos({ x: e.clientX, y: e.clientY, visible: true, screenRadius: brushSize });
      return;
    }
    const rect = c.getBoundingClientRect();
    const scaleRatio = rect.width / c.width;
    const screenRadius = Math.max(6, (brushSize * scaleRatio) / 2);
    setCursorPos({ x: e.clientX, y: e.clientY, visible: true, screenRadius });
  };

  // Freehand stroke drawing & erasing
  const drawStrokeSegment = (p1, p2) => {
    const m = maskRef.current;
    if (!m) return;
    const radius = brushSize / 2;
    const mCtx = m.getContext('2d');
    mCtx.save();
    mCtx.lineCap = 'round';
    mCtx.lineJoin = 'round';

    if (brushMode === 'erase') {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.lineWidth = radius * 2;
      mCtx.beginPath();
      mCtx.moveTo(p1.x, p1.y);
      mCtx.lineTo(p2.x, p2.y);
      mCtx.stroke();
      mCtx.beginPath();
      mCtx.arc(p2.x, p2.y, radius, 0, Math.PI * 2);
      mCtx.fill();
    } else {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.strokeStyle = '#818cf8';
      mCtx.fillStyle = '#818cf8';
      mCtx.lineWidth = radius * 2;
      mCtx.beginPath();
      mCtx.moveTo(p1.x, p1.y);
      mCtx.lineTo(p2.x, p2.y);
      mCtx.stroke();
      mCtx.beginPath();
      mCtx.arc(p2.x, p2.y, radius, 0, Math.PI * 2);
      mCtx.fill();
    }

    mCtx.restore();
    renderAll();
  };

  const drawSpot = (p) => {
    const m = maskRef.current;
    if (!m) return;
    const radius = brushSize / 2;
    const mCtx = m.getContext('2d');
    mCtx.save();

    if (brushMode === 'erase') {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.beginPath();
      mCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      mCtx.fill();
    } else {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.fillStyle = '#818cf8';
      mCtx.beginPath();
      mCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      mCtx.fill();
    }

    mCtx.restore();
    renderAll();
  };

  // Canvas Mouse Down
  const handleMouseDown = (e) => {
    if (isScrollMode) {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }
    if (e.button !== 0) return;

    const coords = getCanvasCoords(e);

    if (activeTool === 'box') {
      pushHistory();
      const newBox = {
        id: `box_${Date.now()}`,
        corner: null,
        x: coords.x,
        y: coords.y,
        w: 10,
        h: 10,
      };
      setBoxes((prev) => [...prev, newBox]);
      setSelectedBoxId(newBox.id);
      setTransformInteraction({
        type: 'resize',
        handle: 'se',
        boxId: newBox.id,
        startMouse: coords,
        startBox: { ...newBox },
      });
      return;
    }

    if (activeTool === 'brush') {
      pushHistory();
      isDrawing.current = true;
      lastPoint.current = coords;
      drawSpot(coords);
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e) => {
    updateCursor(e);

    if (isPanning.current) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
      return;
    }

    const coords = getCanvasCoords(e);

    if (transformInteraction) {
      const { type, handle, boxId, startMouse, startBox } = transformInteraction;
      const dx = coords.x - startMouse.x;
      const dy = coords.y - startMouse.y;

      setBoxes((prev) =>
        prev.map((b) => {
          if (b.id !== boxId) return b;

          if (type === 'move') {
            const nextX = Math.max(0, Math.min(imgDims.w - b.w, startBox.x + dx));
            const nextY = Math.max(0, Math.min(imgDims.h - b.h, startBox.y + dy));
            return { ...b, x: Math.round(nextX), y: Math.round(nextY) };
          }

          if (type === 'resize') {
            let nextX = startBox.x;
            let nextY = startBox.y;
            let nextW = startBox.w;
            let nextH = startBox.h;

            if (handle.includes('e')) nextW = Math.max(20, startBox.w + dx);
            if (handle.includes('s')) nextH = Math.max(20, startBox.h + dy);
            if (handle.includes('w')) {
              const maxDx = startBox.w - 20;
              const appliedDx = Math.min(maxDx, dx);
              nextX = startBox.x + appliedDx;
              nextW = startBox.w - appliedDx;
            }
            if (handle.includes('n')) {
              const maxDy = startBox.h - 20;
              const appliedDy = Math.min(maxDy, dy);
              nextY = startBox.y + appliedDy;
              nextH = startBox.h - appliedDy;
            }

            return {
              ...b,
              x: Math.round(Math.max(0, nextX)),
              y: Math.round(Math.max(0, nextY)),
              w: Math.round(Math.min(imgDims.w - nextX, nextW)),
              h: Math.round(Math.min(imgDims.h - nextY, nextH)),
            };
          }

          return b;
        })
      );
      return;
    }

    if (isDrawing.current && activeTool === 'brush') {
      if (lastPoint.current) {
        drawStrokeSegment(lastPoint.current, coords);
      }
      lastPoint.current = coords;
    }
  };

  const handleMouseUp = () => {
    if (isPanning.current) isPanning.current = false;
    if (transformInteraction) {
      setTransformInteraction(null);
      saveCurrentMaskToItem();
      renderAll();
    }
    if (isDrawing.current) {
      isDrawing.current = false;
      saveCurrentMaskToItem();
    }
    lastPoint.current = null;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setSpacePressed(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === '[') {
        if (activeTool === 'brush') setBrushSize((s) => Math.max(10, s - 15));
        else if (selectedBox) updateSelectedBox({ w: Math.max(20, selectedBox.w - 20), h: Math.max(20, selectedBox.h - 15) });
      } else if (e.key === ']') {
        if (activeTool === 'brush') setBrushSize((s) => Math.min(450, s + 15));
        else if (selectedBox) updateSelectedBox({ w: selectedBox.w + 20, h: selectedBox.h + 15 });
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('scroll');
      } else if (e.key.toLowerCase() === 'b') {
        setActiveTool('brush');
        setBrushMode('paint');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('brush');
        setBrushMode('erase');
      } else if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'm') {
        setActiveTool('box');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBox && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          removeSelectedBox();
        }
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetView();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShowShortcuts((s) => !s);
      } else if (e.key === '\\' || e.key.toLowerCase() === 'o') {
        setShowOriginalBig(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        isPanning.current = false;
      } else if (e.key === '\\' || e.key.toLowerCase() === 'o') {
        setShowOriginalBig(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo, activeTool, selectedBox, selectedBoxId]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Dedicated Drag Handler for Split Comparison Slider (No canvas movement)
  const handleSliderPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSlider(true);

    const onPointerMove = (ev) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
      setSliderPos(percent);
    };

    const onPointerUp = () => {
      setIsDraggingSlider(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const isViewModified = zoom !== 1 || pan.x !== 0 || pan.y !== 0;
  const readyCount = items.filter((i) => i.hasMask && i.status !== 'done').length;
  const cleanedCount = items.filter((i) => i.status === 'done' && i.resultUrl).length;

  return (
    <div style={{ flex: 1, display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', position: 'relative', background: '#07050f' }}>
      <canvas ref={maskRef} style={{ display: 'none' }} />

      {/* ─── Keyboard Shortcuts Modal ─── */}
      {showShortcuts && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setShowShortcuts(false)}>
          <div style={{
            background: 'rgba(15, 12, 32, 0.95)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '24px 28px', maxWidth: 440, width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 32px rgba(99,102,241,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                <Keyboard size={18} color="#818cf8" /> Keyboard Shortcuts
              </div>
              <button onClick={() => setShowShortcuts(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {[
                ['R / M', 'Interactive Transform Box Tool'],
                ['B', 'Circular Brush (Paint)'],
                ['E', 'Eraser / Reverse Brush'],
                ['Space (hold) / H', 'Pan & Scroll Mode'],
                ['[ / ]', 'Decrease / Increase Size Slider'],
                ['Delete / Backspace', 'Remove Selected Watermark Box'],
                ['Ctrl + Z / Ctrl + Y', 'Undo / Redo Action'],
                ['Ctrl + 0', 'Reset Zoom & Center View'],
                ['\\ or O (hold)', 'Hold to Flash Original Photo'],
                ['?', 'Toggle Shortcuts Sheet'],
              ].map(([key, desc], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#cbd5e1' }}>{desc}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#a5b4fc', fontFamily: 'monospace', fontWeight: 700 }}>
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 1. LEFT SIDEBAR (Batch Image Queue) ─── */}
      <div style={{
        width: 280,
        background: 'rgba(10, 8, 22, 0.96)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 25,
        backdropFilter: 'blur(20px)',
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="#818cf8" />
              <span>Batch Queue ({items.length}/5)</span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              {cleanedCount > 0 ? `${cleanedCount} of ${items.length} cleaned` : `${readyCount} ready to clean`}
            </div>
          </div>
          <button
            onClick={onResetBatch}
            className="btn-secondary btn-sm"
            style={{ padding: '4px 8px', fontSize: 11 }}
            title="Upload new batch and wipe storage"
          >
            New Batch
          </button>
        </div>

        {/* Sidebar Image Cards List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {items.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const isCleaned = item.status === 'done' && item.resultUrl;
            const isProcessing = item.status === 'processing';

            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                style={{
                  padding: '10px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(139, 92, 246, 0.22))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid',
                  borderColor: isSelected
                    ? '#818cf8'
                    : isCleaned
                    ? 'rgba(16, 185, 129, 0.45)'
                    : item.hasMask
                    ? 'rgba(99, 102, 241, 0.4)'
                    : 'rgba(255, 255, 255, 0.07)',
                  boxShadow: isSelected ? '0 8px 24px rgba(99, 102, 241, 0.25)' : 'none',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Thumbnail Preview */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#000',
                  flexShrink: 0,
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <img
                    src={isCleaned ? item.resultUrl : item.srcUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'rgba(0,0,0,0.8)',
                    fontSize: 9,
                    fontWeight: 700,
                    color: isCleaned ? '#34d399' : '#818cf8',
                  }}>
                    #{idx + 1}
                  </div>
                </div>

                {/* Card Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: isSelected ? '#fff' : '#e2e0f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </div>
                  
                  {/* Status Indicator */}
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {isProcessing ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: '#818cf8' }}>
                        <Loader2 size={11} className="animate-spin" /> Inpainting...
                      </span>
                    ) : isCleaned ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: '#34d399',
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '2px 7px',
                        borderRadius: 6,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}>
                        <Check size={10} /> Cleaned {item.timingInfo ? `(${item.timingInfo.inference_seconds || (item.timingInfo.timings?.total_inference_ms ? (item.timingInfo.timings.total_inference_ms / 1000).toFixed(1) : item.timingInfo.elapsed_seconds)}s)` : ''}
                      </span>
                    ) : item.hasMask ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: '#a5b4fc',
                        background: 'rgba(99, 102, 241, 0.15)',
                        padding: '2px 7px',
                        borderRadius: 6,
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                      }}>
                        <Check size={10} /> Mask Ready
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: '#fbbf24',
                        background: 'rgba(245, 158, 11, 0.12)',
                        padding: '2px 7px',
                        borderRadius: 6,
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                      }}>
                        Needs Mask
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual Download if Cleaned */}
                {isCleaned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSingle(item);
                    }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      padding: 6,
                      cursor: 'pointer',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Download cleaned image & purge storage"
                  >
                    <Download size={13} />
                  </button>
                )}

                {/* Remove button if more than 1 image */}
                {items.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItemFromBatch(idx);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      padding: 4,
                      cursor: 'pointer',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove from batch"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Batch Actions */}
        <div style={{
          padding: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 12, 32, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {readyCount > 0 && (
            <button
              onClick={() => onProcessAllParallel(dilation)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 13,
                borderRadius: 12,
                fontWeight: 700,
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
              }}
            >
              <Play size={14} fill="#fff" />
              <span>Process All {readyCount} {readyCount === 1 ? 'Image' : 'Images'}</span>
            </button>
          )}

          {cleanedCount > 0 && (
            <button
              onClick={onDownloadAllZip}
              disabled={isZipping}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 13,
                borderRadius: 12,
                fontWeight: 700,
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
              }}
            >
              {isZipping ? (
                <><Loader2 size={14} className="animate-spin" /> Packaging ZIP {zipProgress > 0 ? `${zipProgress}%` : ''}...</>
              ) : (
                <><FileArchive size={14} /> Download All ({cleanedCount} Cleaned ZIP)</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. CENTER CANVAS / FIXED ROCK-SOLID VIEWPORT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Sleek Top Bar */}
        <div style={{
          height: 52,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10, 8, 22, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          zIndex: 20,
        }}>
          {/* Active Image Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              Image #{activeIndex + 1} of {items.length}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentItem?.name}
            </span>

            {/* Toggle between Paint Mask & Compare Clean Result */}
            {currentItem?.resultUrl && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: 10, gap: 4, marginLeft: 8 }}>
                <button
                  onClick={() => setViewMode('compare')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: 'none',
                    background: viewMode === 'compare' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    color: viewMode === 'compare' ? '#fff' : '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Split size={12} /> Clean Result
                </button>
                <button
                  onClick={() => setViewMode('paint')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: 'none',
                    background: viewMode === 'paint' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: viewMode === 'paint' ? '#fff' : '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Paintbrush size={12} /> Edit Mask
                </button>
              </div>
            )}
          </div>

          {/* Quick Shortcuts Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowShortcuts((s) => !s)}
              className="btn-secondary btn-sm"
              style={{ padding: '5px 10px', color: '#a5b4fc', fontSize: 11.5, gap: 6 }}
              title="Keyboard Shortcuts ( ? )"
            >
              <Keyboard size={13} />
              <span>Shortcuts</span>
            </button>
          </div>
        </div>

        {/* Stable Viewport Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          onMouseEnter={() => setCursorPos((p) => ({ ...p, visible: true }))}
          onMouseLeave={() => {
            setCursorPos((p) => ({ ...p, visible: false }));
            isDrawing.current = false;
            isPanning.current = false;
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            padding: 24,
            cursor: isScrollMode ? (isPanning.current ? 'grabbing' : 'grab') : (activeTool === 'box' ? 'crosshair' : 'none'),
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            userSelect: 'none',
          }}
        >
          {/* Top Helper Badge (Paint Mode) */}
          {viewMode === 'paint' && (
            <div style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '5px 16px',
              borderRadius: 999,
              background: isScrollMode ? 'rgba(6, 182, 212, 0.2)' : activeTool === 'box' ? 'rgba(168, 85, 247, 0.2)' : brushMode === 'erase' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              border: `1px solid ${isScrollMode ? 'rgba(6, 182, 212, 0.4)' : activeTool === 'box' ? 'rgba(168, 85, 247, 0.4)' : brushMode === 'erase' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
              color: isScrollMode ? '#67e8f9' : activeTool === 'box' ? '#d8b4fe' : brushMode === 'erase' ? '#fca5a5' : '#c7d2fe',
              fontSize: 11.5,
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 10,
            }}>
              {isScrollMode ? (
                <>
                  <Hand size={13} color="#22d3ee" />
                  <span>Scroll Mode: Drag to pan</span>
                </>
              ) : activeTool === 'box' ? (
                <>
                  <BoxSelect size={13} color="#c084fc" />
                  <span>Box Mode: Drag on image to create a box • Move center / Drag handles</span>
                </>
              ) : brushMode === 'erase' ? (
                <>
                  <Eraser size={13} color="#f87171" />
                  <span>Eraser / Reverse Mode: Paint over mask to erase</span>
                </>
              ) : (
                <>
                  <Paintbrush size={13} color="#818cf8" />
                  <span>Brush Mode: Freehand paint over logos</span>
                </>
              )}
            </div>
          )}

          {/* ─── Top-Left Picture-in-Picture Original Thumbnail (Cleaned Compare View) ─── */}
          {viewMode === 'compare' && currentItem?.srcUrl && (
            <div
              onMouseEnter={() => setShowOriginalBig(true)}
              onMouseLeave={() => setShowOriginalBig(false)}
              onMouseDown={() => setShowOriginalBig(true)}
              onMouseUp={() => setShowOriginalBig(false)}
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 45,
                background: 'rgba(15, 12, 32, 0.9)',
                border: '1.5px solid',
                borderColor: showOriginalBig ? '#818cf8' : 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '6px',
                backdropFilter: 'blur(16px)',
                boxShadow: showOriginalBig ? '0 0 24px rgba(99,102,241,0.5)' : '0 8px 24px rgba(0,0,0,0.6)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
              title="Hover or Click & Hold to view the Original unedited photo in BIG"
            >
              <div style={{ width: 100, height: 75, borderRadius: 8, overflow: 'hidden', background: '#000', position: 'relative' }}>
                <img
                  src={currentItem.srcUrl}
                  alt="Original Thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, padding: '1px 4px', borderRadius: 4, background: 'rgba(0,0,0,0.75)', fontSize: 9, fontWeight: 700, color: '#e2e0f0', textAlign: 'center' }}>
                  {showOriginalBig ? 'ORIGINAL (BIG)' : 'Hover: Original'}
                </div>
              </div>
            </div>
          )}

          {/* Canvas Wrapper - Fixed Size to Prevent Image Jumps */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDrawing.current || isPanning.current || transformInteraction ? 'none' : 'transform 0.12s ease-out',
          }}>
            {/* Paint Mode Active Canvas */}
            <canvas
              ref={canvasRef}
              style={{
                display: viewMode === 'paint' ? 'block' : 'none',
                maxWidth: 'calc(100vw - 640px)',
                maxHeight: 'calc(100vh - 160px)',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)',
              }}
            />

            {/* Compare Mode Result View (Full Big Picture or Split Slider) */}
            {viewMode === 'compare' && currentItem?.resultUrl && (
              compareStyle === 'pip' ? (
                /* Primary Big View with Instant Before/After Swap on Hover */
                <div style={{
                  position: 'relative',
                  maxWidth: 'calc(100vw - 640px)',
                  maxHeight: 'calc(100vh - 160px)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Cleaned Result in Big */}
                  <img
                    src={showOriginalBig ? currentItem.srcUrl : currentItem.resultUrl}
                    alt={showOriginalBig ? 'Original' : 'Cleaned'}
                    style={{ display: 'block', maxWidth: 'calc(100vw - 640px)', maxHeight: 'calc(100vh - 160px)', width: 'auto', height: 'auto', objectFit: 'contain' }}
                    draggable={false}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    padding: '4px 12px',
                    borderRadius: 8,
                    background: showOriginalBig ? 'rgba(0,0,0,0.75)' : 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    {showOriginalBig ? 'ORIGINAL PHOTO' : '90%+ CLEANED ✨'}
                  </div>
                </div>
              ) : (
                /* Optional Split Slider Mode */
                <div
                  ref={sliderContainerRef}
                  style={{
                    position: 'relative',
                    maxWidth: 'calc(100vw - 640px)',
                    maxHeight: 'calc(100vh - 160px)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={currentItem.resultUrl}
                    alt="Cleaned"
                    style={{ display: 'block', maxWidth: 'calc(100vw - 640px)', maxHeight: 'calc(100vh - 160px)', width: 'auto', height: 'auto', objectFit: 'contain' }}
                    draggable={false}
                  />
                  <img
                    src={currentItem.srcUrl}
                    alt="Original"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                    }}
                    draggable={false}
                  />

                  {/* Isolated Solid Split Slider Handle */}
                  <div
                    onPointerDown={handleSliderPointerDown}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${sliderPos}%`,
                      width: 28,
                      transform: 'translateX(-50%)',
                      cursor: 'ew-resize',
                      zIndex: 35,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ width: 2, height: '100%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} />
                    <div style={{
                      position: 'absolute',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#090714',
                      border: '2px solid #22d3ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      color: '#22d3ee',
                      boxShadow: '0 0 16px rgba(34,211,238,0.6)',
                      fontWeight: 700,
                    }}>
                      ↔
                    </div>
                  </div>
                </div>
              )
            )}

            {/* ─── Interactive Resizable & Movable Transform Boxes Overlay (Paint Mode) ─── */}
            {viewMode === 'paint' && showMask && canvasRef.current && imgDims.w > 0 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: isScrollMode ? 'none' : 'auto',
              }}>
                {boxes.map((b) => {
                  const isSelected = b.id === selectedBoxId || (!selectedBoxId && boxes[boxes.length - 1]?.id === b.id);
                  const leftPct = (b.x / imgDims.w) * 100;
                  const topPct = (b.y / imgDims.h) * 100;
                  const widthPct = (b.w / imgDims.w) * 100;
                  const heightPct = (b.h / imgDims.h) * 100;

                  return (
                    <div
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBoxId(b.id);
                      }}
                      onMouseDown={(e) => {
                        if (e.button !== 0 || isScrollMode) return;
                        e.stopPropagation();
                        setSelectedBoxId(b.id);
                        pushHistory();
                        const coords = getCanvasCoords(e);
                        setTransformInteraction({
                          type: 'move',
                          handle: null,
                          boxId: b.id,
                          startMouse: coords,
                          startBox: { ...b },
                        });
                      }}
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        backgroundColor: isSelected ? 'rgba(129, 140, 248, 0.45)' : 'rgba(129, 140, 248, 0.3)',
                        border: isSelected ? '2px solid #818cf8' : '1.5px dashed rgba(165, 180, 252, 0.7)',
                        borderRadius: 4,
                        cursor: 'move',
                        boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.6), inset 0 0 12px rgba(99,102,241,0.3)' : 'none',
                        zIndex: isSelected ? 30 : 20,
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(15, 12, 32, 0.95)',
                            border: '1px solid #818cf8',
                            borderRadius: 6,
                            padding: '2px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            pointerEvents: 'auto',
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <span>{b.w} × {b.h}px</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedBox();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f87171',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Delete Box (Del)"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )}

                      {isSelected && !isScrollMode && (
                        <>
                          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
                            const isTop = handle.includes('n');
                            const isBottom = handle.includes('s');
                            const isLeft = handle.includes('w');
                            const isRight = handle.includes('e');

                            let left = '50%';
                            let top = '50%';
                            let cursor = 'pointer';

                            if (isTop) top = '0%';
                            if (isBottom) top = '100%';
                            if (isLeft) left = '0%';
                            if (isRight) left = '100%';

                            if (handle === 'nw' || handle === 'se') cursor = 'nwse-resize';
                            else if (handle === 'ne' || handle === 'sw') cursor = 'nesw-resize';
                            else if (handle === 'n' || handle === 's') cursor = 'ns-resize';
                            else if (handle === 'e' || handle === 'w') cursor = 'ew-resize';

                            return (
                              <div
                                key={handle}
                                onMouseDown={(e) => {
                                  if (e.button !== 0) return;
                                  e.stopPropagation();
                                  pushHistory();
                                  const coords = getCanvasCoords(e);
                                  setTransformInteraction({
                                    type: 'resize',
                                    handle,
                                    boxId: b.id,
                                    startMouse: coords,
                                    startBox: { ...b },
                                  });
                                }}
                                style={{
                                  position: 'absolute',
                                  left,
                                  top,
                                  width: 10,
                                  height: 10,
                                  backgroundColor: '#ffffff',
                                  border: '2px solid #6366f1',
                                  borderRadius: 2,
                                  transform: 'translate(-50%, -50%)',
                                  cursor,
                                  boxShadow: '0 0 6px rgba(0,0,0,0.6)',
                                  zIndex: 40,
                                }}
                              />
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Brush Cursor Overlay */}
          {activeTool === 'brush' && !isScrollMode && cursorPos.visible && (
            <div
              style={{
                position: 'fixed',
                left: cursorPos.x,
                top: cursorPos.y,
                width: cursorPos.screenRadius * 2,
                height: cursorPos.screenRadius * 2,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: `2px solid ${brushMode === 'erase' ? '#f87171' : '#818cf8'}`,
                backgroundColor: brushMode === 'erase' ? 'rgba(248,113,113,0.25)' : 'rgba(129,140,248,0.25)',
                boxShadow: `0 0 14px ${brushMode === 'erase' ? 'rgba(248,113,113,0.6)' : 'rgba(129,140,248,0.6)'}`,
                pointerEvents: 'none',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#fff' }} />
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. RIGHT SIDEBAR (Studio Tool & Preset Inspector) ─── */}
      <div style={{
        width: 300,
        background: 'rgba(10, 8, 22, 0.96)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 25,
        backdropFilter: 'blur(20px)',
      }}>
        {/* Right Sidebar Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sliders size={16} color="#818cf8" />
            <span>Tools &amp; Presets</span>
          </div>
          <span style={{ fontSize: 11, color: '#a5b4fc', background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
            Photo #{activeIndex + 1}
          </span>
        </div>

        {/* Scrollable Tool Options */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {viewMode === 'paint' ? (
            <>
              {/* Section 1: Tool Selection Modes */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                  Active Tool
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'box', label: 'Box Tool', icon: BoxSelect, key: 'R', color: '#c084fc' },
                    { id: 'brush', label: 'Brush', icon: Paintbrush, key: 'B', color: '#818cf8' },
                    { id: 'scroll', label: 'Pan', icon: Hand, key: 'H', color: '#22d3ee' },
                  ].map((t) => {
                    const isSelected = activeTool === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTool(t.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          padding: '10px 6px',
                          borderRadius: 10,
                          border: '1px solid',
                          borderColor: isSelected ? t.color : 'rgba(255, 255, 255, 0.08)',
                          background: isSelected
                            ? `rgba(${t.id === 'brush' ? '99,102,241' : t.id === 'box' ? '168,85,247' : '6,182,212'}, 0.25)`
                            : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? '#fff' : '#9ca3af',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon size={16} color={isSelected ? t.color : '#9ca3af'} />
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</span>
                        <span style={{ fontSize: 9, color: '#6b7280', fontFamily: 'monospace' }}>[{t.key}]</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── CASE A: BRUSH TOOL ACTIVE ─── */}
              {activeTool === 'brush' && (
                <div style={{ background: 'rgba(99, 102, 241, 0.06)', padding: '14px', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  
                  {/* Brush Mode Switcher: Paint vs Reverse/Eraser */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                      Brush Action Mode
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <button
                        onClick={() => setBrushMode('paint')}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 10px', borderRadius: 8, border: '1px solid',
                          borderColor: brushMode === 'paint' ? '#818cf8' : 'rgba(255,255,255,0.08)',
                          background: brushMode === 'paint' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.04)',
                          color: brushMode === 'paint' ? '#fff' : '#9ca3af',
                          fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        <Paintbrush size={13} />
                        <span>Paint [B]</span>
                      </button>

                      <button
                        onClick={() => setBrushMode('erase')}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 10px', borderRadius: 8, border: '1px solid',
                          borderColor: brushMode === 'erase' ? '#f87171' : 'rgba(255,255,255,0.08)',
                          background: brushMode === 'erase' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.04)',
                          color: brushMode === 'erase' ? '#fff' : '#9ca3af',
                          fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        <Eraser size={13} />
                        <span>Reverse [E]</span>
                      </button>
                    </div>
                  </div>

                  {/* Brush Size Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Brush Size</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: brushMode === 'erase' ? '#f87171' : '#818cf8', background: 'rgba(255,255,255,0.08)', padding: '1px 7px', borderRadius: 6 }}>
                      {brushSize}px
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setBrushSize((s) => Math.max(10, s - 10))}
                      style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Decrease brush size ( [ )"
                    >
                      <Minus size={12} />
                    </button>

                    <input
                      type="range"
                      min={10}
                      max={450}
                      value={brushSize}
                      onChange={(e) => setBrushSize(+e.target.value)}
                      style={{ flex: 1 }}
                    />

                    <button
                      onClick={() => setBrushSize((s) => Math.min(450, s + 10))}
                      style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Increase brush size ( ] )"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── CASE B: BOX TOOL ACTIVE ─── */}
              {activeTool === 'box' && (
                <>
                  {/* Box Transform Sliders */}
                  {selectedBox ? (
                    <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '14px', borderRadius: 12, border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#e9d5ff', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Move size={14} color="#c084fc" /> Box Size &amp; Position
                        </span>
                        <button
                          onClick={removeSelectedBox}
                          style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          <Trash2 size={12} /> Remove Box
                        </button>
                      </div>

                      {/* Width Slider */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1', marginBottom: 4 }}>
                          <span>Width</span>
                          <span style={{ fontWeight: 700, color: '#c084fc' }}>{selectedBox.w}px</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => updateSelectedBox({ w: Math.max(20, selectedBox.w - 15) })}
                            style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer' }}
                          >-</button>
                          <input
                            type="range"
                            min={20}
                            max={Math.min(imgDims.w, 900)}
                            value={selectedBox.w}
                            onChange={(e) => updateSelectedBox({ w: +e.target.value })}
                            style={{ flex: 1 }}
                          />
                          <button
                            onClick={() => updateSelectedBox({ w: Math.min(imgDims.w - selectedBox.x, selectedBox.w + 15) })}
                            style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer' }}
                          >+</button>
                        </div>
                      </div>

                      {/* Height Slider */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1', marginBottom: 4 }}>
                          <span>Height</span>
                          <span style={{ fontWeight: 700, color: '#c084fc' }}>{selectedBox.h}px</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => updateSelectedBox({ h: Math.max(20, selectedBox.h - 15) })}
                            style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer' }}
                          >-</button>
                          <input
                            type="range"
                            min={20}
                            max={Math.min(imgDims.h, 700)}
                            value={selectedBox.h}
                            onChange={(e) => updateSelectedBox({ h: +e.target.value })}
                            style={{ flex: 1 }}
                          />
                          <button
                            onClick={() => updateSelectedBox({ h: Math.min(imgDims.h - selectedBox.y, selectedBox.h + 15) })}
                            style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer' }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', fontSize: 11.5, color: '#9ca3af', textAlign: 'center' }}>
                      Drag on image to create a box, or click a corner preset:
                    </div>
                  )}

                  {/* Corner Watermark Presets */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                      <Crosshair size={14} color="#818cf8" />
                      <span>Corner Presets</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {[
                        { id: 'top-left', label: 'Top-Left', icon: '⬉' },
                        { id: 'top-right', label: 'Top-Right', icon: '⬈' },
                        { id: 'bottom-left', label: 'Bottom-Left', icon: '⬋' },
                        { id: 'bottom-right', label: 'Bottom-Right', icon: '⬊' },
                      ].map(({ id, label, icon }) => {
                        const isActive = boxes.some((b) => b.corner === id);
                        return (
                          <button
                            key={id}
                            onClick={() => applyOrToggleCornerBox(id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1px solid',
                              borderColor: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.08)',
                              background: isActive
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'rgba(255,255,255,0.04)',
                              color: isActive ? '#fff' : '#cbd5e1',
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: isActive ? '0 0 14px rgba(99,102,241,0.5)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                            title={`Click to place a resizable box at ${label}`}
                          >
                            <span>{icon} {label}</span>
                            {isActive ? <Check size={12} /> : <span style={{ opacity: 0.3 }}>+</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Edge Dilation Slider */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Edge Dilation</span>
                  <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 700 }}>{dilation}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={dilation}
                  onChange={(e) => setDilation(+e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Section 4: History & Actions */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                  Actions &amp; History
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="btn-secondary btn-sm"
                    style={{
                      padding: '10px',
                      opacity: canUndo ? 1 : 0.4,
                      justifyContent: 'center',
                      borderColor: canUndo ? '#818cf8' : 'rgba(255,255,255,0.08)',
                      color: canUndo ? '#fff' : '#6b7280',
                      cursor: canUndo ? 'pointer' : 'not-allowed',
                    }}
                    title="Undo (Ctrl+Z)"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="btn-secondary btn-sm"
                    style={{
                      padding: '10px',
                      opacity: canRedo ? 1 : 0.4,
                      justifyContent: 'center',
                      borderColor: canRedo ? '#818cf8' : 'rgba(255,255,255,0.08)',
                      color: canRedo ? '#fff' : '#6b7280',
                      cursor: canRedo ? 'pointer' : 'not-allowed',
                    }}
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCw size={15} />
                  </button>
                  <button
                    onClick={() => setShowMask((s) => !s)}
                    className="btn-secondary btn-sm"
                    style={{ padding: '10px', color: showMask ? '#a5b4fc' : '#9ca3af', justifyContent: 'center' }}
                    title="Toggle Mask Overlay"
                  >
                    {showMask ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={clearMask}
                    disabled={!currentItem?.hasMask && boxes.length === 0}
                    className="btn-secondary btn-sm"
                    style={{
                      padding: '10px',
                      opacity: currentItem?.hasMask || boxes.length > 0 ? 1 : 0.4,
                      color: currentItem?.hasMask || boxes.length > 0 ? '#f87171' : '#6b7280',
                      borderColor: currentItem?.hasMask || boxes.length > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)',
                      justifyContent: 'center',
                      cursor: currentItem?.hasMask || boxes.length > 0 ? 'pointer' : 'not-allowed',
                    }}
                    title="Clear All Masks & Boxes"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Section 5: Zoom Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 600 }}>Zoom</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.2).toFixed(2)))}
                    style={{ padding: '4px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span style={{ fontSize: 11, color: '#cbd5e1', padding: '0 4px', minWidth: 38, textAlign: 'center', fontWeight: 600 }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(4, +(z + 0.2).toFixed(2)))}
                    style={{ padding: '4px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={resetView}
                    style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 10.5, fontWeight: 700 }}
                  >
                    Fit
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Cleaned Comparison Mode in Right Sidebar */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <CheckCircle2 size={16} /> 90%+ AI Precision
                </div>
                <p style={{ fontSize: 11.5, color: '#9ca3af', lineHeight: 1.5, margin: 0 }}>
                  Watermark removed cleanly. Hover the top-left thumbnail to flash the original.
                </p>
              </div>

              {/* View Style Switcher (PIP Hover vs Split Slider) */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>
                  Compare View Style
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => setCompareStyle('pip')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '6px 8px', borderRadius: 6, border: '1px solid',
                      borderColor: compareStyle === 'pip' ? '#818cf8' : 'transparent',
                      background: compareStyle === 'pip' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                      color: compareStyle === 'pip' ? '#fff' : '#9ca3af',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <ImageIcon size={12} /> Hover PIP
                  </button>
                  <button
                    onClick={() => setCompareStyle('split')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '6px 8px', borderRadius: 6, border: '1px solid',
                      borderColor: compareStyle === 'split' ? '#22d3ee' : 'transparent',
                      background: compareStyle === 'split' ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.04)',
                      color: compareStyle === 'split' ? '#fff' : '#9ca3af',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <Split size={12} /> Split Slider
                  </button>
                </div>
              </div>

              {/* Hold to View Original Button */}
              <button
                onMouseDown={() => setShowOriginalBig(true)}
                onMouseUp={() => setShowOriginalBig(false)}
                onMouseLeave={() => setShowOriginalBig(false)}
                onTouchStart={() => setShowOriginalBig(true)}
                onTouchEnd={() => setShowOriginalBig(false)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  justifyContent: 'center',
                  gap: 8,
                  borderColor: showOriginalBig ? '#818cf8' : 'rgba(255,255,255,0.15)',
                  background: showOriginalBig ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                }}
                title="Hold down to flash original photo ( \\ key )"
              >
                <Eye size={15} color={showOriginalBig ? '#818cf8' : '#9ca3af'} />
                <span>Hold to View Original ( \ )</span>
              </button>

              <button
                onClick={() => setViewMode('paint')}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 12, justifyContent: 'center', gap: 6 }}
              >
                <Paintbrush size={14} /> Re-edit Mask
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 12, 32, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {viewMode === 'paint' ? (
            <button
              onClick={() => onProcessSingleImage(activeIndex, dilation)}
              disabled={(!currentItem?.hasMask && boxes.length === 0) || currentItem?.status === 'processing'}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: 13.5,
                borderRadius: 12,
                fontWeight: 700,
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                opacity: (currentItem?.hasMask || boxes.length > 0) && currentItem?.status !== 'processing' ? 1 : 0.4,
                cursor: (currentItem?.hasMask || boxes.length > 0) && currentItem?.status !== 'processing' ? 'pointer' : 'not-allowed',
              }}
            >
              {currentItem?.status === 'processing' ? (
                <><Loader2 size={15} className="animate-spin" /> Inpainting Photo #{activeIndex + 1}...</>
              ) : (
                <><Sparkles size={15} /> Clean Photo #{activeIndex + 1}</>
              )}
            </button>
          ) : (
            <button
              onClick={() => onDownloadSingle(currentItem)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: 13.5,
                borderRadius: 12,
                fontWeight: 700,
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
              }}
            >
              <Download size={15} /> Download Clean Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Batch Image Studio Page ─── */
export default function ImageStudioPage() {
  const [stage, setStage] = useState('upload');
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(null);
  const [downloadToast, setDownloadToast] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  useEffect(() => {
    if (!sessionStorage.getItem('cleanmark_session_id')) {
      sessionStorage.setItem('cleanmark_session_id', generateSessionId());
    }
  }, []);

  const onFilesSelected = (batchItems) => {
    setItems(batchItems);
    setActiveIndex(0);
    setStage('studio');
    setError(null);
  };

  const onUpdateItemMask = (idx, maskData, hasMask, activeBoxes = []) => {
    setItems((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], maskCanvas: maskData, hasMask, activeBoxes };
      }
      return next;
    });
  };

  const onRemoveItemFromBatch = (idx) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) {
        purgeClientStorage(items);
        setStage('upload');
        return [];
      }
      if (activeIndex >= next.length) {
        setActiveIndex(next.length - 1);
      }
      return next;
    });
  };

  const exportBinaryMaskBlob = (maskImageData, activeBoxes = []) => {
    return new Promise((resolve) => {
      const w = maskImageData ? maskImageData.width : 1000;
      const h = maskImageData ? maskImageData.height : 1000;

      const binaryCanvas = document.createElement('canvas');
      binaryCanvas.width = w;
      binaryCanvas.height = h;
      const bCtx = binaryCanvas.getContext('2d');
      bCtx.fillStyle = '#000000';
      bCtx.fillRect(0, 0, w, h);

      if (maskImageData) {
        const bData = bCtx.getImageData(0, 0, w, h);
        const mData = maskImageData;

        for (let i = 0; i < mData.data.length; i += 4) {
          if (mData.data[i + 3] > 10) {
            bData.data[i] = 255;
            bData.data[i + 1] = 255;
            bData.data[i + 2] = 255;
            bData.data[i + 3] = 255;
          }
        }
        bCtx.putImageData(bData, 0, 0);
      }

      if (activeBoxes && activeBoxes.length > 0) {
        bCtx.fillStyle = '#ffffff';
        activeBoxes.forEach((b) => {
          bCtx.fillRect(b.x, b.y, b.w, b.h);
        });
      }

      binaryCanvas.toBlob(resolve, 'image/png');
    });
  };

  // Process Single Image
  const onProcessSingleImage = async (idx, dilation) => {
    const item = items[idx];
    if (!item) return;

    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], status: 'processing' };
      return next;
    });
    setError(null);

    try {
      const maskBlob = await exportBinaryMaskBlob(item.maskCanvas, item.activeBoxes || []);
      const apiRes = await inpaintImage(item.file, maskBlob, dilation);
      const cleanedDataUrl = apiRes.image_data || apiRes.result_b64 || apiRes.data_url;

      setItems((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          status: 'done',
          resultUrl: cleanedDataUrl,
          timingInfo: apiRes,
        };
        return next;
      });
    } catch (err) {
      console.error(err);
      setError(err.message || `Error inpainting image #${idx + 1}`);
      setItems((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], status: 'ready' };
        return next;
      });
    }
  };

  // Process ALL Ready Images in Parallel
  const onProcessAllParallel = async (dilation) => {
    const readyIndices = [];
    const readyPayloads = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const hasAnyMask = item.hasMask || (item.activeBoxes && item.activeBoxes.length > 0);
      if (hasAnyMask && item.status !== 'done') {
        readyIndices.push(i);
        const maskBlob = await exportBinaryMaskBlob(item.maskCanvas, item.activeBoxes || []);
        readyPayloads.push({
          file: item.file,
          name: item.name,
          maskBlob,
        });
      }
    }

    if (readyPayloads.length === 0) return;

    setItems((prev) => {
      const next = [...prev];
      readyIndices.forEach((idx) => {
        next[idx] = { ...next[idx], status: 'processing' };
      });
      return next;
    });
    setError(null);

    try {
      const batchRes = await inpaintBatch(readyPayloads, dilation);
      const resultsArray = batchRes.results || [];

      setItems((prev) => {
        const next = [...prev];
        readyIndices.forEach((itemIdx, resultIdx) => {
          const res = resultsArray[resultIdx];
          if (res && res.image_data) {
            next[itemIdx] = {
              ...next[itemIdx],
              status: 'done',
              resultUrl: res.image_data,
              timingInfo: res,
            };
          }
        });
        return next;
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing batch images');
      setItems((prev) => {
        const next = [...prev];
        readyIndices.forEach((idx) => {
          next[idx] = { ...next[idx], status: 'ready' };
        });
        return next;
      });
    }
  };

  const downloadSingle = (item) => {
    if (!item?.resultUrl) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = `cleanmark_${item.name || 'cleaned.jpg'}`;
    a.click();

    purgeClientStorage([item]);
    setDownloadToast(true);
  };

  const downloadAllZip = async () => {
    setIsZipping(true);
    setZipProgress(0);
    try {
      const zip = new JSZip();
      const folder = zip.folder('cleanmark_cleaned_images');

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.resultUrl) {
          const res = await fetch(item.resultUrl);
          const blob = await res.blob();
          folder.file(`clean_${i + 1}_${item.name}`, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(Math.round(metadata.percent));
      });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `cleanmark_batch_${Date.now()}.zip`;
      a.click();

      purgeClientStorage(items);
      setDownloadToast(true);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const resetBatch = () => {
    purgeClientStorage(items);
    sessionStorage.setItem('cleanmark_session_id', generateSessionId());
    setItems([]);
    setActiveIndex(0);
    setError(null);
    setStage('upload');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
      {/* Toast Notification with Storage Clear Confirmation */}
      {downloadToast && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(16, 185, 129, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #34d399',
          color: '#fff',
          padding: '12px 22px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 24px rgba(16,185,129,0.4)',
          animation: 'fade-up 0.3s ease-out',
        }}>
          <Lock size={20} color="#fff" />
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            Downloaded! All temporary session storage, cache & memory URLs have been securely purged.
          </div>
          <button
            onClick={() => setDownloadToast(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, marginLeft: 8 }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed', top: 76, right: 24, zIndex: 1000,
          background: 'rgba(239, 68, 68, 0.95)', border: '1px solid #f87171',
          color: '#fff', padding: '12px 18px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 8, fontSize: 16 }}>×</button>
        </div>
      )}

      {stage === 'upload' && <MultiUploader onFilesSelected={onFilesSelected} />}
      
      {stage === 'studio' && items.length > 0 && (
        <UnifiedStudioPanel
          items={items}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onUpdateItemMask={onUpdateItemMask}
          onProcessSingleImage={onProcessSingleImage}
          onProcessAllParallel={onProcessAllParallel}
          onResetBatch={resetBatch}
          onRemoveItemFromBatch={onRemoveItemFromBatch}
          onDownloadSingle={downloadSingle}
          onDownloadAllZip={downloadAllZip}
          isZipping={isZipping}
          zipProgress={zipProgress}
        />
      )}
    </div>
  );
}
