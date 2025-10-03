// app/types/svg.ts

export interface UploadedSVG {
  id: number;
  name: string;
  content: string;
}

export interface CanvasSVG {
  id: number;
  sourceId: number;
  name: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SVGDimensions {
  width: number;
  height: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface DraggingState {
  type: 'sidebar';
  id: number;
}