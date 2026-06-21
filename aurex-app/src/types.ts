export type ToolMode = 'select' | 'text' | 'shape';
export type ShapeType = 'rect' | 'circle' | 'ellipse' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'diamond' | 'line';
export type AnimEffect = '' | 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInTop' | 'slideInBottom' | 'zoomIn' | 'bounce' | 'rotate' | 'flip';

export interface Slide {
  version: string;
  objects: any[];
  name: string;
  duration: number;
}
