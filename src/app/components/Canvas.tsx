// app/components/Canvas.tsx

import React from 'react';
import { GripVertical } from 'lucide-react';
import { CanvasSVG as CanvasSVGComponent } from './CanvasSVG';
import { CanvasSizeIndicator } from './CanvasSizeIndicator';
import { CanvasSVG, CanvasSize } from '../types/svg';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasSize: CanvasSize;
  isResizingCanvas: boolean;
  canvasSVGs: CanvasSVG[];
  selectedId: number | null;
  onCanvasDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onCanvasClick: () => void;
  onSVGMouseDown: (e: React.MouseEvent, svgId: number) => void;
  onSVGClick: (e: React.MouseEvent, svgId: number) => void;
  onSVGResize: (e: React.MouseEvent, svgId: number) => void;
  onSVGDelete: (svgId: number) => void;
  onCanvasResizeMouseDown: (e: React.MouseEvent) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  canvasRef,
  canvasSize,
  isResizingCanvas,
  canvasSVGs,
  selectedId,
  onCanvasDrop,
  onDragOver,
  onCanvasClick,
  onSVGMouseDown,
  onSVGClick,
  onSVGResize,
  onSVGDelete,
  onCanvasResizeMouseDown,
}) => {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">SVG Merger & Customizer</h1>
        <p className="text-gray-600">Upload SVGs, arrange them on canvas, and export</p>
      </div>

      <div className="relative inline-block">
        <div
          ref={canvasRef}
          className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
          style={{ width: canvasSize.width, height: canvasSize.height }}
          onDrop={onCanvasDrop}
          onDragOver={onDragOver}
          onClick={onCanvasClick}
        >
          <CanvasSizeIndicator canvasSize={canvasSize} isResizing={isResizingCanvas} />

          {canvasSVGs.map((svg) => (
            <CanvasSVGComponent
              key={svg.id}
              svg={svg}
              isSelected={selectedId === svg.id}
              onMouseDown={(e) => onSVGMouseDown(e, svg.id)}
              onClick={(e) => onSVGClick(e, svg.id)}
              onResize={(e) => onSVGResize(e, svg.id)}
              onDelete={() => onSVGDelete(svg.id)}
            />
          ))}
        </div>

        <div
          className="absolute bottom-0 right-0 w-6 h-6 bg-gray-400 cursor-nwse-resize rounded-tl hover:bg-gray-500"
          onMouseDown={onCanvasResizeMouseDown}
        >
          <GripVertical size={16} className="text-white m-1" />
        </div>
      </div>
    </div>
  );
};