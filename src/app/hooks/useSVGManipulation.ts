// app/hooks/useSVGManipulation.ts

import { useState, useCallback } from 'react';
import { CanvasSVG } from '../types/svg';

export const useSVGManipulation = (
  canvasSVGs: CanvasSVG[],
  setCanvasSVGs: React.Dispatch<React.SetStateAction<CanvasSVG[]>>
) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSVGMouseDown = useCallback((e: React.MouseEvent, svgId: number) => {
    if ((e.target as HTMLElement).closest('.delete-btn')) return;
    e.stopPropagation();
    setSelectedId(svgId);
    
    const svg = canvasSVGs.find((s) => s.id === svgId);
    if (!svg) return;

    const startX = e.clientX - svg.x;
    const startY = e.clientY - svg.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setCanvasSVGs((prev) =>
        prev.map((s) =>
          s.id === svgId
            ? { ...s, x: moveEvent.clientX - startX, y: moveEvent.clientY - startY }
            : s
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [canvasSVGs, setCanvasSVGs]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, svgId: number) => {
    e.stopPropagation();
    const svg = canvasSVGs.find((s) => s.id === svgId);
    if (!svg) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = svg.width;
    const startHeight = svg.height;
    const aspectRatio = startWidth / startHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const delta = Math.max(deltaX, deltaY);
      
      setCanvasSVGs((prev) =>
        prev.map((s) =>
          s.id === svgId
            ? {
                ...s,
                width: Math.max(20, startWidth + delta),
                height: Math.max(20, (startWidth + delta) / aspectRatio),
              }
            : s
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [canvasSVGs, setCanvasSVGs]);

  const deleteSVG = useCallback((svgId: number) => {
    setCanvasSVGs((prev) => prev.filter((s) => s.id !== svgId));
    setSelectedId(null);
  }, [setCanvasSVGs]);

  return {
    selectedId,
    setSelectedId,
    handleSVGMouseDown,
    handleResizeMouseDown,
    deleteSVG,
  };
};