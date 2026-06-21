import { createContext, useContext } from 'react';
import type { fabric } from 'fabric';
import type { ToolMode, ShapeType, Slide } from './types';

export interface CanvasContextType {
  canvas: fabric.Canvas | null;
  slides: Slide[];
  currentIndex: number;
  mode: ToolMode;
  shapeType: ShapeType;
  lineDash: boolean;
  showProps: boolean;
  slidesTotalDuration: number;
  setCanvas: (c: fabric.Canvas) => void;
  setMode: (m: ToolMode) => void;
  setShapeType: (s: ShapeType) => void;
  setLineDash: (d: boolean) => void;
  saveSlide: () => void;
  loadSlide: (idx: number) => void;
  addScene: () => void;
  deleteScene: (i: number) => void;
  switchScene: (i: number) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  showProperties: (obj: fabric.Object) => void;
  closeProperties: () => void;
  refreshSceneList: () => void;
  enterPresentation: (startIndex: number) => void;
}

export const CanvasContext = createContext<CanvasContextType>(null!);
export const useCanvas = () => useContext(CanvasContext);
