// app/hooks/useSVGUpload.ts

import { useCallback, useRef } from 'react';
import { UploadedSVG } from '../types/svg';

export const useSVGUpload = (
  setUploadedSVGs: React.Dispatch<React.SetStateAction<UploadedSVG[]>>
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newSVG: UploadedSVG = {
            id: Date.now() + Math.random(),
            name: file.name,
            content: content,
          };
          setUploadedSVGs((prev) => [...prev, newSVG]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setUploadedSVGs]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
  };
};