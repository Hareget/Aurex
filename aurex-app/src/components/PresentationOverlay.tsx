import { useEffect, useRef, useCallback } from 'react';
import type { Slide } from '../types';

interface Props {
  slides: Slide[];
  presSlideIndex: number;
  presObjectIndex: number;
  presAnimatedObjects: any[];
  setPresSlideIndex: (i: number) => void;
  setPresObjectIndex: (i: number) => void;
  setPresAnimatedObjects: (a: any[]) => void;
  setPresenting: (p: boolean) => void;
}

const CANVAS_W = 960;
const CANVAS_H = 540;

export default function PresentationOverlay({
  slides, presSlideIndex, presObjectIndex, presAnimatedObjects,
  setPresSlideIndex, setPresObjectIndex, setPresAnimatedObjects, setPresenting,
}: Props) {
  const objContainerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ presSlideIndex, presObjectIndex, presAnimatedObjects });
  stateRef.current = { presSlideIndex, presObjectIndex, presAnimatedObjects };

  const renderPresSlide = useCallback(() => {
    const container = objContainerRef.current;
    if (!container) return;
    container.innerHTML = '';
    setPresObjectIndex(0);
    setPresAnimatedObjects([]);

    const slide = slides[presSlideIndex];
    if (!slide) return;

    const winW = window.innerWidth, winH = window.innerHeight;
    const scale = Math.min(winW / CANVAS_W, winH / CANVAS_H);
    const offX = (winW - CANVAS_W * scale) / 2, offY = (winH - CANVAS_H * scale) / 2;

    const allAnimated: HTMLElement[] = [];

    slide.objects.forEach((objData: any) => {
      const anim = objData.customAnimation || '';
      const el = document.createElement('div');
      el.className = 'pres-obj';
      el.dataset.index = objData.index;

      const left = (objData.left || 0) * scale + offX;
      const top = (objData.top || 0) * scale + offY;

      if (objData.type === 'i-text' || objData.type === 'textbox') {
        el.classList.add('pres-text');
        el.textContent = objData.text || '';
        el.style.left = left + 'px'; el.style.top = top + 'px';
        el.style.fontFamily = objData.fontFamily || 'Arial';
        el.style.fontSize = (objData.fontSize || 36) * scale + 'px';
        el.style.color = objData.fill || '#000';
        el.style.fontWeight = objData.fontWeight || 'normal';
        el.style.fontStyle = objData.fontStyle || 'normal';
        el.style.textDecoration = objData.textDecoration || '';
        el.style.textAlign = objData.textAlign || 'left';
        el.style.width = (objData.width || 200) * scale + 'px';
        el.style.height = (objData.height || 50) * scale + 'px';
        if (objData.backgroundColor) el.style.background = objData.backgroundColor;
      } else {
        const w = (objData.width || 100) * scale, h = (objData.height || 100) * scale;
        el.style.left = left + 'px'; el.style.top = top + 'px';
        el.style.width = w + 'px'; el.style.height = h + 'px';
        const fill = objData.fill || 'transparent', stroke = objData.stroke || 'transparent';
        const sw = (objData.strokeWidth || 0) * scale;

        if (objData.type === 'circle') {
          el.style.borderRadius = '50%'; el.style.background = fill;
          if (sw > 0) el.style.border = `${sw}px solid ${stroke}`;
        } else if (objData.type === 'ellipse') {
          el.style.borderRadius = '50%'; el.style.background = fill;
          if (sw > 0) el.style.border = `${sw}px solid ${stroke}`;
          el.style.width = ((objData.rx || 60) * 2 * scale) + 'px'; el.style.height = ((objData.ry || 40) * 2 * scale) + 'px';
        } else if (objData.type === 'rect') {
          el.style.background = fill;
          if (sw > 0) el.style.border = `${sw}px solid ${stroke}`;
          if (objData.rx) el.style.borderRadius = objData.rx * scale + 'px';
          if (objData.ry) el.style.borderRadius = objData.ry * scale + 'px';
        } else if (objData.type === 'line') {
          el.style.height = Math.max((objData.strokeWidth || 3) * scale, 1) + 'px';
          el.style.background = objData.stroke || '#333';
          el.style.width = Math.abs((objData.x2 - objData.x1 || 120) * scale) + 'px';
        } else if (objData.type === 'polygon') {
          el.classList.add('pres-poly');
          const pts = objData.points || [{ x: -60, y: 0 }, { x: 60, y: 0 }, { x: 0, y: 60 }];
          let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity;
          pts.forEach((p: any) => { mnX = Math.min(mnX, p.x); mxX = Math.max(mxX, p.x); mnY = Math.min(mnY, p.y); mxY = Math.max(mxY, p.y); });
          const pw = mxX - mnX || 1, ph = mxY - mnY || 1;
          const svgPts = pts.map((p: any) => `${((p.x - mnX) / pw * 100).toFixed(1)},${((p.y - mnY) / ph * 100).toFixed(1)}`).join(' ');
          el.style.width = w + 'px'; el.style.height = h + 'px';
          el.innerHTML = `<svg viewBox="0 0 100 100"><polygon points="${svgPts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw > 0 ? Math.max(sw / scale, .5) : .5}"/></svg>`;
          el.style.background = 'none'; el.style.border = 'none';
        }
      }
      if (objData.angle) el.style.transform = `rotate(${objData.angle}deg)`;
      if (anim) {
        el.dataset.anim = anim;
        el.dataset.duration = objData.animDuration || 500;
        el.dataset.delay = objData.animDelay || 0;
        allAnimated.push(el);
      } else el.classList.add('visible');
      container.appendChild(el);
    });

    setPresAnimatedObjects(allAnimated);
    setPresObjectIndex(0);
  }, [slides, presSlideIndex, setPresAnimatedObjects, setPresObjectIndex]);

  const showNextPresObj = useCallback(() => {
    const totalAnimated = stateRef.current.presAnimatedObjects.length;
    if (stateRef.current.presObjectIndex >= totalAnimated) {
      if (stateRef.current.presSlideIndex < slides.length - 1) {
        setPresSlideIndex(stateRef.current.presSlideIndex + 1);
        setPresObjectIndex(0);
      } else {
        setPresenting(false);
      }
      return;
    }
    const container = objContainerRef.current;
    if (!container) return;
    const els = container.querySelectorAll('.pres-obj');
    const el = els[stateRef.current.presObjectIndex] as HTMLElement;
    if (el) {
      const anim = el.dataset.anim;
      const dur = el.dataset.duration || 500;
      const delay = el.dataset.delay || 0;
      el.style.setProperty('--anim-dur', (Number(dur) / 1000) + 's');
      el.style.animationDelay = (Number(delay) / 1000) + 's';
      requestAnimationFrame(() => {
        el.classList.add('visible', 'anim-' + anim);
      });
      setPresObjectIndex(stateRef.current.presObjectIndex + 1);
    }
  }, [slides, setPresSlideIndex, setPresObjectIndex, setPresenting]);

  useEffect(() => {
    renderPresSlide();
  }, [presSlideIndex, renderPresSlide]);

  useEffect(() => {
    const totalAnimated = presAnimatedObjects.length;
    const pct = totalAnimated ? Math.min(presObjectIndex / totalAnimated * 100, 100) : 100;
    const progress = document.getElementById('presProgress');
    if (progress) progress.style.width = pct + '%';

    const total = totalAnimated;
    const remaining = total - presObjectIndex;
    const counter = document.getElementById('presCounter');
    if (counter) counter.textContent = remaining > 0 ? `${remaining} more` : 'Click for next slide';
  }, [presObjectIndex, presAnimatedObjects]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) showNextPresObj();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); showNextPresObj(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (stateRef.current.presObjectIndex > 0) {
          setPresObjectIndex(stateRef.current.presObjectIndex - 1);
          const container = objContainerRef.current;
          if (container) {
            const els = container.querySelectorAll('.pres-obj');
            const el = els[stateRef.current.presObjectIndex - 1] as HTMLElement;
            if (el) {
              el.classList.remove('visible');
              const a = el.dataset.anim;
              if (a) el.classList.remove('anim-' + a);
              void el.offsetWidth;
            }
          }
        } else if (stateRef.current.presSlideIndex > 0) {
          setPresSlideIndex(stateRef.current.presSlideIndex - 1);
          setPresObjectIndex(0);
        }
      }
      if (e.key === 'Escape') setPresenting(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showNextPresObj, setPresenting, setPresSlideIndex, setPresObjectIndex]);

  const slideNumText = `Slide ${presSlideIndex + 1} of ${slides.length}`;

  return (
    <div id="presentationOverlay" className="active" onClick={handleOverlayClick}>
      <div id="presProgress"></div>
      <div id="presentationObjects" ref={objContainerRef}></div>
      <span id="presSlideNum">{slideNumText}</span>
      <span id="presCounter"></span>
    </div>
  );
}
