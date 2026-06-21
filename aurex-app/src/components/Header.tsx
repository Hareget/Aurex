import { useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '../CanvasContext';

export default function Header() {
  const { mode, setMode, setShapeType, lineDash, setLineDash, undo, redo, slides, currentIndex, canvas, saveSlide, pushHistory, enterPresentation } = useCanvas();
  const pickerRef = useRef<HTMLDivElement>(null);
  const shapeBtnRef = useRef<HTMLButtonElement>(null);
  const previewDdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.classList.contains('show')) return;
      if (pickerRef.current && shapeBtnRef.current &&
          !pickerRef.current.contains(e.target as Node) &&
          !shapeBtnRef.current.contains(e.target as Node)) {
        pickerRef.current.classList.remove('show');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const toggleShapePicker = () => {
    if (!pickerRef.current || !shapeBtnRef.current) return;
    const show = pickerRef.current.classList.toggle('show');
    setMode('shape');
    if (show) {
      const r = shapeBtnRef.current.getBoundingClientRect();
      pickerRef.current.style.left = Math.max(8, Math.min(r.left + r.width / 2 - 140, window.innerWidth - 288)) + 'px';
      pickerRef.current.style.top = (r.bottom + 4) + 'px';
    }
  };

  const selectShape = (shape: string) => {
    setShapeType(shape as any);
    const c = canvas;
    if (!c) return;
    const w = 120, h = 120;
    const opts = { left: 960 / 2 - 60, top: 540 / 2 - 60, fill: '#4a90d9', stroke: '#333', strokeWidth: 2, customAnimation: '', animDuration: 500, animDelay: 0 };
    let obj: fabric.Object | undefined;
    switch (shape) {
      case 'rect': obj = new fabric.Rect({ ...opts, width: w, height: h }); break;
      case 'circle': obj = new fabric.Circle({ ...opts, radius: w / 2 }); break;
      case 'ellipse': obj = new fabric.Ellipse({ ...opts, rx: w / 2, ry: h / 3 }); break;
      case 'triangle': case 'pentagon': case 'hexagon': case 'star': case 'arrow': case 'diamond':
        obj = new fabric.Polygon(getShapePoints(shape, w, h), { ...opts }); break;
      case 'line':
        obj = new fabric.Line([0, 0, 120, 0], { left: 960 / 2 - 60, top: 540 / 2, stroke: '#333', strokeWidth: 3, fill: '', customAnimation: '', animDuration: 500, animDelay: 0 }); break;
    }
    if (obj) {
      obj.on('modified', () => saveSlide());
      obj.setControlVisible('mtr', true);
      c.add(obj);
      c.setActiveObject(obj);
      c.renderAll();
      saveSlide();
      pushHistory();
    }
    pickerRef.current?.classList.remove('show');
  };

  const togglePreview = () => {
    previewDdRef.current?.classList.toggle('show');
  };

  const startPreview = (fromStart: boolean) => {
    previewDdRef.current?.classList.remove('show');
    saveSlide();
    enterPresentation(fromStart ? 0 : currentIndex);
  };

  const handleExport = () => {
    saveSlide();
    const c = canvas;
    if (!c) return;
    const data = c.toDataURL({ format: 'png', multiplier: 2 });
    const a = document.createElement('a');
    a.href = data;
    a.download = `${slides[currentIndex]?.name || 'Scene'}.png`;
    a.click();
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        fabric.Image.fromURL(ev.target!.result as string, (img: fabric.Image) => {
          const w = img.width!, h = img.height!;
          const s = Math.min(400 / w, 400 / h, 1);
          img.set({
            left: 960 / 2 - w * s / 2,
            top: 540 / 2 - h * s / 2,
            scaleX: s,
            scaleY: s,
            customAnimation: '',
            animDuration: 500,
            animDelay: 0,
          });
          img.on('modified', () => saveSlide());
          img.setControlVisible('mtr', true);
          c?.add(img);
          c?.setActiveObject(img);
          c?.renderAll();
          saveSlide();
          pushHistory();
          c?.discardActiveObject().renderAll();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const toggleLineDash = () => {
    const d = !lineDash;
    setLineDash(d);
    const active = canvas?.getActiveObject();
    if (active) {
      active.set('strokeDashArray', d ? [5, 5] : null);
      canvas!.renderAll();
      saveSlide();
    }
  };

  return (
    <>
      <div id="header">
        <div className="hdr-section hdr-left">
          <div id="logo">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" fill="#0078d4" /><rect x="14" y="3" width="7" height="7" rx="1" fill="#0078d4" opacity=".6" /><rect x="3" y="14" width="7" height="7" rx="1" fill="#0078d4" opacity=".4" /><rect x="14" y="14" width="7" height="7" rx="1" fill="#0078d4" opacity=".2" /></svg>
            AUREX
          </div>
        </div>
        <div className="hdr-section hdr-center">
          <button className={'hdr-btn' + (mode === 'text' ? ' active' : '')} data-mode="text" onClick={() => setMode('text')}>
            <svg viewBox="0 0 16 16"><path d="M4.5 13.5l1.5-4m4 4l-1.5-4m-3.5 0l2-5.5 2 5.5m-4 0h4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Text
          </button>
          <button ref={shapeBtnRef} className={'hdr-btn' + (mode === 'shape' ? ' active' : '')} data-mode="shape" onClick={toggleShapePicker}>
            <svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3" fill="none" /><rect x="4" y="9" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
            Shape
          </button>
          <button className="hdr-btn" onClick={handleImageUpload}>
            <svg viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" /><circle cx="5.5" cy="5.5" r="1" fill="currentColor" /><path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Image
          </button>
          <div className="hdr-sep" />
          <button className={'hdr-btn' + (mode === 'select' ? ' active' : '')} id="selectToolBtn" onClick={() => setMode('select')}>
            <svg viewBox="0 0 16 16"><path d="M3 2l10 4-4 1.5L7 12l-2-5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <div className="hdr-section hdr-right">
          <button className="hdr-btn icon-btn" title="Undo" onClick={undo}>
            <svg viewBox="0 0 16 16"><path d="M4 7l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 4v3a3 3 0 01-3 3H2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          </button>
          <button className="hdr-btn icon-btn" title="Redo" onClick={redo}>
            <svg viewBox="0 0 16 16"><path d="M12 7l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 4v3a3 3 0 003 3h7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          </button>
          <div className="hdr-sep" />
          <div className="preview-wrap">
            <button className="preview-btn" onClick={togglePreview}>
              <svg viewBox="0 0 16 16" width="16" height="16"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
              Preview <span className="arrow">▾</span>
            </button>
            <div className="preview-dropdown" ref={previewDdRef}>
              <button onClick={() => startPreview(false)}>
                <svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
                Play from Current Scene
                <div className="desc">Start presentation from current slide</div>
              </button>
              <button onClick={() => startPreview(true)}>
                <svg viewBox="0 0 16 16"><path d="M3 2.5v11l10-5.5z" fill="currentColor" /></svg>
                Start from Beginning
                <div className="desc">Start presentation from slide 1</div>
              </button>
            </div>
          </div>
          <button className="hdr-btn" onClick={handleExport}>
            <svg viewBox="0 0 16 16"><path d="M8 2v8m0 0l-3-3m3 3l3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Export
          </button>
          <button className={'hdr-btn icon-btn' + (lineDash ? ' active' : '')} title="Line type" onClick={toggleLineDash}>
            <svg viewBox="0 0 16 16"><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" /></svg>
          </button>
          <button className="hdr-btn icon-btn" title="Settings">
            <svg viewBox="0 0 16 16"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2" fill="none" /><path d="M8 1.5v1m0 11v1M2.5 8h1m9 0h1M3.8 3.8l.7.7m7 .7l.7.7M3.8 12.2l.7-.7m7-.7l.7-.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg>
          </button>
        </div>
      </div>

      <div className="shape-picker" ref={pickerRef}>
        <div className="shape-picker-grid">
          {[['rect', '▬'], ['circle', '●'], ['ellipse', '⬮'], ['triangle', '△'], ['line', '╱'], ['pentagon', '⬠'], ['hexagon', '⬡'], ['star', '★'], ['arrow', '→'], ['diamond', '◇']].map(([s, label]) => (
            <div key={s} className="shape-picker-item" data-shape={s} title={s.charAt(0).toUpperCase() + s.slice(1)} onClick={() => selectShape(s)}>{label}</div>
          ))}
        </div>
      </div>
    </>
  );
}

function getShapePoints(type: string, w: number, h: number) {
  switch (type) {
    case 'triangle': return [{ x: 0, y: -h / 2 }, { x: -w / 2, y: h / 2 }, { x: w / 2, y: h / 2 }];
    case 'pentagon': { const p = []; for (let i = 0; i < 5; i++) { const a = Math.PI / 2 * 3 + i * 2 * Math.PI / 5; p.push({ x: w / 2 * Math.cos(a), y: h / 2 * Math.sin(a) }); } return p; }
    case 'hexagon': { const p = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 6; p.push({ x: w / 2 * Math.cos(a), y: h / 2 * Math.sin(a) }); } return p; }
    case 'star': { const p = [], o = h / 2, i = h / 4; for (let j = 0; j < 10; j++) { const a = Math.PI / 2 * 3 + j * Math.PI / 5, r = j % 2 === 0 ? o : i; p.push({ x: w / 2 * Math.cos(a) * (r / h * 2), y: r * Math.sin(a) }); } return p; }
    case 'arrow': return [{ x: -w / 2, y: -h / 4 }, { x: 0, y: -h / 4 }, { x: 0, y: -h / 2 }, { x: w / 2, y: 0 }, { x: 0, y: h / 2 }, { x: 0, y: h / 4 }, { x: -w / 2, y: h / 4 }];
    case 'diamond': return [{ x: 0, y: -h / 2 }, { x: w / 2, y: 0 }, { x: 0, y: h / 2 }, { x: -w / 2, y: 0 }];
    default: return [];
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export { getShapePoints };
