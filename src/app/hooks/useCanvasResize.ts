// app/hooks/useCanvasResize.ts

import { useState, useCallback } from 'react';
import { CanvasSize } from '../types/svg';

export const useCanvasResize = (initialSize: CanvasSize = { width: 1600, height: 800 }) => {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(initialSize);
  const [isResizingCanvas, setIsResizingCanvas] = useState(false);

  const handleCanvasResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizingCanvas(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = canvasSize.width;
    const startHeight = canvasSize.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setCanvasSize({
        width: Math.max(400, startWidth + deltaX),
        height: Math.max(300, startHeight + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsResizingCanvas(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [canvasSize]);

  return {
    canvasSize,
    isResizingCanvas,
    handleCanvasResizeMouseDown,
  };
};