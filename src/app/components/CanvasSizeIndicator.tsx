// app/components/CanvasSizeIndicator.tsx

import React from 'react';
import { CanvasSize } from '../types/svg';

interface CanvasSizeIndicatorProps {
  canvasSize: CanvasSize;
  isResizing: boolean;
}

export const CanvasSizeIndicator: React.FC<CanvasSizeIndicatorProps> = ({
  canvasSize,
  isResizing,
}) => {
  return (
    <div
      className={`absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-mono transition-opacity ${
        isResizing ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {canvasSize.width} × {canvasSize.height}
    </div>
  );
};