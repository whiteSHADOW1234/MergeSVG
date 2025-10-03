// app/components/SidebarSVGItem.tsx

import React from 'react';
import { Trash2 } from 'lucide-react';
import { UploadedSVG } from '../types/svg';

interface SidebarSVGItemProps {
  svg: UploadedSVG;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}

export const SidebarSVGItem: React.FC<SidebarSVGItemProps> = ({
  svg,
  onDragStart,
  onDragEnd,
  onDelete,
}) => {
  return (
    <div
      className="svg-item relative bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors group"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className="w-full h-24 flex items-center justify-center bg-white rounded"
        dangerouslySetInnerHTML={{ __html: svg.content }}
      />
      <button
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};