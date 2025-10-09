// app/components/Canvas.tsx

import React from 'react';
import { GripVertical } from 'lucide-react';
import { CanvasSVG as CanvasSVGComponent } from './CanvasSVG';
import { CanvasSizeIndicator } from './CanvasSizeIndicator';
import { CanvasSVG, CanvasSize } from '../types/svg';
import { CanvasBackgroundConfig } from './CanvasControlSidebar';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasSize: CanvasSize;
  isResizingCanvas: boolean;
  canvasSVGs: CanvasSVG[];
  selectedId: number | null;
  backgroundConfig: CanvasBackgroundConfig;
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
  backgroundConfig,
  onCanvasDrop,
  onDragOver,
  onCanvasClick,
  onSVGMouseDown,
  onSVGClick,
  onSVGResize,
  onSVGDelete,
  onCanvasResizeMouseDown,
}) => {
  // Generate background style based on config
  const getBackgroundStyle = (): React.CSSProperties => {
    const baseColor = backgroundConfig.backgroundColor;
    const alpha = backgroundConfig.transparency;
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const backgroundColor = hexToRgba(baseColor, alpha);

    let backgroundImage = 'none';
    let backgroundSize = 'auto';
    let backgroundPosition = '0 0';

    switch (backgroundConfig.pattern) {
      case 'grid':
        backgroundImage = `
          linear-gradient(${backgroundConfig.gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${backgroundConfig.gridColor} 1px, transparent 1px)
        `;
        backgroundSize = `${backgroundConfig.gridSize}px ${backgroundConfig.gridSize}px`;
        break;
      case 'dots':
        backgroundImage = `radial-gradient(circle, ${backgroundConfig.gridColor} 1px, transparent 1px)`;
        backgroundSize = `${backgroundConfig.gridSize}px ${backgroundConfig.gridSize}px`;
        break;
      case 'checkerboard':
        const size = backgroundConfig.gridSize;
        const halfSize = size / 2;
        backgroundImage = `
          linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
          linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
          linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
        `;
        backgroundSize = `${size}px ${size}px`;
        backgroundPosition = `0 0, 0 ${halfSize}px, ${halfSize}px -${halfSize}px, -${halfSize}px 0px`;
        break;
    }

    return {
      backgroundColor,
      backgroundImage,
      backgroundSize,
      backgroundPosition,
    };
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="relative inline-block">
        <div
          ref={canvasRef}
          className="relative border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
          style={{ 
            width: canvasSize.width, 
            height: canvasSize.height,
            ...getBackgroundStyle(),
          }}
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