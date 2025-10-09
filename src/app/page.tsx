'use client';

// app/page.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { Sidebar } from './components/Sidebar';
import { CanvasControlSidebar, CanvasBackgroundConfig } from './components/CanvasControlSidebar';
import { useSVGUpload } from './hooks/useSVGUpload';
import { useCanvasResize } from './hooks/useCanvasResize';
import { useSVGManipulation } from './hooks/useSVGManipulation';
import { exportMergedSVG, extractSVGDimensions } from './utils/svgExport';
import { UploadedSVG, CanvasSVG, DraggingState } from './types/svg';

export default function SVGMergerApp() {
  const [uploadedSVGs, setUploadedSVGs] = useState<UploadedSVG[]>([]);
  const [canvasSVGs, setCanvasSVGs] = useState<CanvasSVG[]>([]);
  const [draggingFrom, setDraggingFrom] = useState<DraggingState | null>(null);
  const [canvasBackgroundConfig, setCanvasBackgroundConfig] = useState<CanvasBackgroundConfig>({
    backgroundColor: '#ffffff',
    transparency: 1,
    showGrid: false,
    gridSize: 20,
    gridColor: '#e5e7eb',
    pattern: 'none',
  });
  
  const canvasRef = useRef<HTMLDivElement>(null!);
  
  const { fileInputRef, handleFileUpload, handleDrop, handleDragOver } = useSVGUpload(setUploadedSVGs);
  
  const { canvasSize, isResizingCanvas, handleCanvasResizeMouseDown } = useCanvasResize();
  
  const {
    selectedId,
    setSelectedId,
    handleSVGMouseDown,
    handleResizeMouseDown,
    deleteSVG,
  } = useSVGManipulation(canvasSVGs, setCanvasSVGs);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggingFrom && draggingFrom.type === 'sidebar') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const svg = uploadedSVGs.find((s) => s.id === draggingFrom.id);
      if (svg) {
        const dimensions = extractSVGDimensions(svg.content);
        const newId = Date.now() + Math.random();
        const newCanvasSVG: CanvasSVG = {
          id: newId,
          sourceId: svg.id,
          name: svg.name,
          content: svg.content,
          x: x - dimensions.width / 2,
          y: y - dimensions.height / 2,
          width: dimensions.width,
          height: dimensions.height,
        };
        setCanvasSVGs((prev) => [...prev, newCanvasSVG]);
        setSelectedId(newId);
      }
    }
    setDraggingFrom(null);
  }, [draggingFrom, uploadedSVGs, setCanvasSVGs, setSelectedId]);

  const handleExport = useCallback(() => {
    exportMergedSVG(canvasSVGs, canvasSize);
  }, [canvasSVGs, canvasSize]);

  const handleSVGDelete = useCallback((svgId: number) => {
    setUploadedSVGs((prev) => prev.filter((s) => s.id !== svgId));
  }, [setUploadedSVGs]);

  const handleSVGClick = useCallback((e: React.MouseEvent, svgId: number) => {
    e.stopPropagation();
    setSelectedId(svgId);
  }, [setSelectedId]);

  return (
    <div className="flex h-screen bg-gray-50">
      <CanvasControlSidebar
        config={canvasBackgroundConfig}
        onConfigChange={setCanvasBackgroundConfig}
      />
      
      <Canvas
        canvasRef={canvasRef}
        canvasSize={canvasSize}
        isResizingCanvas={isResizingCanvas}
        canvasSVGs={canvasSVGs}
        selectedId={selectedId}
        backgroundConfig={canvasBackgroundConfig}
        onCanvasDrop={handleCanvasDrop}
        onDragOver={handleDragOver}
        onCanvasClick={() => setSelectedId(null)}
        onSVGMouseDown={handleSVGMouseDown}
        onSVGClick={handleSVGClick}
        onSVGResize={handleResizeMouseDown}
        onSVGDelete={deleteSVG}
        onCanvasResizeMouseDown={handleCanvasResizeMouseDown}
      />
      
      <Sidebar
        uploadedSVGs={uploadedSVGs}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onFileUpload={handleFileUpload}
        onSVGDragStart={(id) => setDraggingFrom({ type: 'sidebar', id })}
        onSVGDragEnd={() => setDraggingFrom(null)}
        onSVGDelete={handleSVGDelete}
        onExport={handleExport}
      />
    </div>
  );
}