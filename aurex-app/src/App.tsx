import { useState, useRef, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import type { ToolMode, ShapeType, Slide } from './types';
import { CanvasContext } from './CanvasContext';
import Header from './components/Header';
import ScenePanel from './components/ScenePanel';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import PresentationOverlay from './components/PresentationOverlay';
import './App.css';

const CANVAS_W = 960;
const CANVAS_H = 540;
const MAX_HISTORY = 50;

export default function App() {
  const [canvas, setCanvasState] = useState<fabric.Canvas | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setModeState] = useState<ToolMode>('select');
  const [shapeType, setShapeType] = useState<ShapeType>('rect');
  const [lineDash, setLineDash] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const [propsTarget, setPropsTarget] = useState<fabric.Object | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [presSlideIndex, setPresSlideIndex] = useState(0);
  const [presObjectIndex, setPresObjectIndex] = useState(0);
  const [presAnimatedObjects, setPresAnimatedObjects] = useState<any[]>([]);
  const [sceneRefreshKey, setSceneRefreshKey] = useState(0);
  const [slidesTotalDuration, setSlidesTotalDuration] = useState(0);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const slidesRef = useRef<Slide[]>(slides);
  slidesRef.current = slides;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const setCanvas = useCallback((c: fabric.Canvas) => {
    canvasRef.current = c;
    setCanvasState(c);
  }, []);

  const computeSlideDuration = useCallback((slide: Slide) => {
    if (!slide?.objects) return 0;
    let total = 0;
    slide.objects.forEach((o: any) => {
      if (o.customAnimation) total += (o.animDuration || 500) + (o.animDelay || 0);
    });
    return total;
  }, []);

  const saveSlide = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !slidesRef.current.length) return;
    const idx = currentIndexRef.current;
    const newSlides = [...slidesRef.current];
    const json = c.toJSON(['customAnimation', 'animDuration', 'animDelay']);
    json.name = newSlides[idx]?.name || `Scene ${idx + 1}`;
    const d = computeSlideDuration(json);
    json.duration = d;
    newSlides[idx] = json;
    setSlides(newSlides);
  }, [computeSlideDuration]);

  const loadSlide = useCallback((idx: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const s = slidesRef.current;
    if (!s[idx]) return;
    c.clear();
    c.backgroundColor = '#ffffff';
    c.loadFromJSON(s[idx], () => {
      c.getObjects().forEach(obj => { obj.on('modified', () => saveSlide()); });
      c.renderAll();
      if (c.getObjects().length) c.discardActiveObject().renderAll();
      setShowProps(false);
      setPropsTarget(null);
    });
  }, [saveSlide]);

  const addScene = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.discardActiveObject().renderAll();
    const idx = slidesRef.current.length;
    const newSlides = [...slidesRef.current, { version: fabric.version, objects: [], name: `Scene ${idx + 1}`, duration: 0 }];
    setSlides(newSlides);
    setCurrentIndex(idx);
    setTimeout(() => {
      loadSlide(idx);
      setSceneRefreshKey(k => k + 1);
      pushHistory();
    }, 0);
  }, [loadSlide]);

  const deleteScene = useCallback((i: number) => {
    if (slidesRef.current.length <= 1) return;
    const c = canvasRef.current;
    if (!c) return;
    c.discardActiveObject().renderAll();
    const newSlides = slidesRef.current.filter((_, idx) => idx !== i);
    setSlides(newSlides);
    const newIdx = currentIndexRef.current >= newSlides.length ? newSlides.length - 1 : (currentIndexRef.current > i ? currentIndexRef.current - 1 : currentIndexRef.current);
    setCurrentIndex(newIdx);
    setTimeout(() => {
      loadSlide(newIdx);
      setSceneRefreshKey(k => k + 1);
      pushHistory();
    }, 0);
  }, [loadSlide]);

  const switchScene = useCallback((i: number) => {
    if (i === currentIndexRef.current) return;
    saveSlide();
    setCurrentIndex(i);
    setTimeout(() => loadSlide(i), 0);
  }, [saveSlide, loadSlide]);

  const pushHistory = useCallback(() => {
    const arr = historyRef.current;
    let idx = historyIndexRef.current;
    if (idx < arr.length - 1) historyRef.current = arr.slice(0, idx + 1);
    historyRef.current.push(JSON.stringify(slidesRef.current));
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    else historyIndexRef.current++;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const newSlides = JSON.parse(historyRef.current[historyIndexRef.current]);
    setSlides(newSlides);
    setTimeout(() => {
      loadSlide(currentIndexRef.current);
      setSceneRefreshKey(k => k + 1);
    }, 0);
  }, [loadSlide]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const newSlides = JSON.parse(historyRef.current[historyIndexRef.current]);
    setSlides(newSlides);
    setTimeout(() => {
      loadSlide(currentIndexRef.current);
      setSceneRefreshKey(k => k + 1);
    }, 0);
  }, [loadSlide]);

  const showProperties = useCallback((obj: fabric.Object) => {
    setShowProps(true);
    setPropsTarget(obj);
  }, []);

  const closeProperties = useCallback(() => {
    setShowProps(false);
    setPropsTarget(null);
  }, []);

  const refreshSceneList = useCallback(() => {
    setSceneRefreshKey(k => k + 1);
  }, []);

  const setMode = useCallback((m: ToolMode) => {
    setModeState(m);
  }, []);

  const enterPresentation = useCallback((startIndex: number) => {
    setPresSlideIndex(startIndex);
    setPresObjectIndex(0);
    setPresAnimatedObjects([]);
    setPresenting(true);
  }, []);

  const init = useCallback(() => {
    if (slidesRef.current.length === 0) addScene();
  }, [addScene]);

  useEffect(() => { init(); }, [init]);

  const total = slides.reduce((sum, s) => sum + (s.duration || 0), 0);
  useEffect(() => { setSlidesTotalDuration(total); }, [total]);

  // Keyboard shortcuts (not during presentation)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (presenting) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === 'v' || e.key === 'V') setMode('select');
      if (e.key === 't' || e.key === 'T') setMode('text');
      if ((e.key === 'Delete' || e.key === 'Backspace') && !(document.activeElement?.tagName === 'INPUT')) {
        const c = canvasRef.current;
        const active = c?.getActiveObject();
        if (active) {
          c!.remove(active);
          c!.discardActiveObject().renderAll();
          saveSlide();
          pushHistory();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [presenting, undo, redo, setMode, saveSlide, pushHistory]);

  // Prevent context menu globally
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  const ctx = {
    canvas, slides, currentIndex, mode, shapeType, lineDash, showProps, slidesTotalDuration,
    setCanvas, setMode, setShapeType, setLineDash, saveSlide, loadSlide,
    addScene, deleteScene, switchScene, pushHistory, undo, redo,
    showProperties, closeProperties, refreshSceneList,
    enterPresentation,
  };

  return (
    <CanvasContext.Provider value={ctx}>
      <div id="app">
        <Header />
        <div id="body">
          <ScenePanel key={sceneRefreshKey} />
          <CanvasArea />
          <PropertiesPanel />
        </div>
      </div>
      {presenting && (
        <PresentationOverlay
          slides={slides}
          presSlideIndex={presSlideIndex}
          presObjectIndex={presObjectIndex}
          presAnimatedObjects={presAnimatedObjects}
          setPresSlideIndex={setPresSlideIndex}
          setPresObjectIndex={setPresObjectIndex}
          setPresAnimatedObjects={setPresAnimatedObjects}
          setPresenting={setPresenting}
        />
      )}
    </CanvasContext.Provider>
  );
}
