// app/components/Sidebar.tsx

import React from 'react';
import { Upload, Download } from 'lucide-react';
import { SidebarSVGItem } from './SidebarSVGItem';
import { UploadedSVG } from '../types/svg';

interface SidebarProps {
  uploadedSVGs: UploadedSVG[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onFileUpload: (files: FileList | null) => void;
  onSVGDragStart: (id: number) => void;
  onSVGDragEnd: () => void;
  onSVGDelete: (id: number) => void;
  onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  uploadedSVGs,
  fileInputRef,
  onDrop,
  onDragOver,
  onFileUpload,
  onSVGDragStart,
  onSVGDragEnd,
  onSVGDelete,
  onExport,
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
      <div
        className="flex-1 overflow-y-auto p-4 border-2 border-dashed border-gray-300 m-4 mb-0 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.svg-item')) {
            fileInputRef.current?.click();
          }
        }}
      >
        {uploadedSVGs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Upload className="mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600">Drop SVG files here or click to upload</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {uploadedSVGs.map((svg) => (
              <SidebarSVGItem
                key={svg.id}
                svg={svg}
                onDragStart={() => onSVGDragStart(svg.id)}
                onDragEnd={onSVGDragEnd}
                onDelete={() => onSVGDelete(svg.id)}
              />
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => onFileUpload(e.target.files)}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium"
          onClick={onExport}
        >
          <Download size={18} />
          Export Merged SVG
        </button>
      </div>
    </div>
  );
};