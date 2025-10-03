// app/components/CanvasSVG.tsx

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CanvasSVG as CanvasSVGType } from '../types/svg';
import { extractSVGDimensions } from '../utils/svgExport';

interface CanvasSVGProps {
  svg: CanvasSVGType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onResize: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

export const CanvasSVG: React.FC<CanvasSVGProps> = ({
  svg,
  isSelected,
  onMouseDown,
  onClick,
  onResize,
  onDelete,
}) => {
  const originalDimensions = extractSVGDimensions(svg.content);
  const scale = svg.width / originalDimensions.width;

  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: svg.x,
        top: svg.y,
        width: svg.width,
        height: svg.height,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        dangerouslySetInnerHTML={{ __html: svg.content }}
        className="w-full h-full pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />

      {isSelected && (
        <>
          <button
            className="delete-btn absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={16} />
          </button>

          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize rounded-tl"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize(e);
            }}
          />
        </>
      )}
    </div>
  );
};