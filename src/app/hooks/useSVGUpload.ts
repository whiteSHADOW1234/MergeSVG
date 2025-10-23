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

  const handleURLUpload = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('svg') && !url.endsWith('.svg')) {
        throw new Error('URL does not point to an SVG file');
      }
      
      const content = await response.text();
      
      // Validate that the content is actually SVG
      if (!content.trim().startsWith('<svg') && !content.includes('<svg')) {
        throw new Error('Content is not a valid SVG file');
      }
      
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'remote-svg.svg';
      const name = fileName.endsWith('.svg') ? fileName : fileName + '.svg';
      
      const newSVG: UploadedSVG = {
        id: Date.now() + Math.random(),
        name: name,
        content: content,
      };
      
      setUploadedSVGs((prev) => [...prev, newSVG]);
    } catch (error) {
      console.error('Error loading SVG from URL:', error);
      throw error;
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
    handleURLUpload,
    handleDrop,
    handleDragOver,
  };
};