// app/hooks/useCanvasResize.ts

import { useState, useCallback, useEffect } from 'react';
import { CanvasSize } from '../types/svg';

const SIDEBAR_WIDTH = 320; // 80 * 4 (w-80 from Tailwind = 320px)
const PADDING = 48; // 6 * 4 (p-6 = 24px per side, so 48px total horizontal)
const MIN_CANVAS_WIDTH = 400;
const MIN_CANVAS_HEIGHT = 300;
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 800;

const calculateInitialCanvasSize = (): CanvasSize => {
  if (typeof window === 'undefined') {
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }; // Fallback for SSR
  }

  // Calculate available width: window width - both sidebars - padding
  const availableWidth = window.innerWidth - (SIDEBAR_WIDTH * 2) - PADDING;
  // Calculate available height: window height - padding (with some margin for scrolling)
  const availableHeight = window.innerHeight - PADDING - 100; // Extra margin for better UX

  return {
    width: Math.max(MIN_CANVAS_WIDTH, Math.min(availableWidth, DEFAULT_WIDTH)),
    height: Math.max(MIN_CANVAS_HEIGHT, Math.min(availableHeight, DEFAULT_HEIGHT)),
  };
};

export const useCanvasResize = () => {
  // Start with default size to match SSR
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ 
    width: DEFAULT_WIDTH, 
    height: DEFAULT_HEIGHT 
  });
  const [isResizingCanvas, setIsResizingCanvas] = useState(false);

  // Calculate and set the dynamic canvas size only on the client side after mount
  useEffect(() => {
    setCanvasSize(calculateInitialCanvasSize());
  }, []); // Empty dependency array - only runs once on mount

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