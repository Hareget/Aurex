import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '../CanvasContext';

export default function CanvasArea() {
  const { setCanvas, mode, saveSlide, pushHistory, showProperties } = useCanvas();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (canvasRef.current) return;
    const c = new fabric.Canvas('mainCanvas', {
      width: 960,
      height: 540,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = c;
    setCanvas(c);

    const onObjModified = () => saveSlide();

    c.on('mouse:down', (opt) => {
      if (!opt.e) return;
      const btn = opt.e.button !== undefined ? opt.e.button : (opt.e as any).which;
      if (btn !== 0) return;
      if (modeRef.current !== 'text') return;
      const p = opt.pointer;
      const text = new fabric.IText('Type here', {
        left: p?.x ?? 480,
        top: p?.y ?? 270,
        fontFamily: 'Arial',
        fontSize: 36,
        fill: '#333',
        stroke: '',
        strokeWidth: 0,
        customAnimation: '',
        animDuration: 500,
        animDelay: 0,
      });
      text.on('modified', onObjModified);
      c.add(text);
      c.setActiveObject(text);
      c.renderAll();
      saveSlide();
      pushHistory();
    });

    c.on('object:modified', onObjModified);

    return () => {
      c.dispose();
      canvasRef.current = null;
    };
  }, []);

  // Native contextmenu handler for right-click → properties
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const c = canvasRef.current;
    if (!wrapper || !c) return;

    const handler = (e: MouseEvent) => {
      e.preventDefault();
      const rect = c.getElement().getBoundingClientRect();
      const ptr = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const objs = c.getObjects();
      let target: fabric.Object | null = null;
      for (let i = objs.length - 1; i >= 0; i--) {
        if (objs[i].containsPoint(ptr)) { target = objs[i]; break; }
      }
      if (target) {
        c.discardActiveObject();
        c.setActiveObject(target);
        c.renderAll();
        showProperties(target);
      }
    };

    wrapper.addEventListener('contextmenu', handler);
    return () => wrapper.removeEventListener('contextmenu', handler);
  }, [showProperties]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.isDrawingMode = false;
    c.selection = mode === 'select';
    c.defaultCursor = mode === 'text' ? 'text' : 'default';
  }, [mode]);

  return (
    <div id="canvasWrap" ref={wrapperRef}>
      <canvas id="mainCanvas" />
    </div>
  );
}
