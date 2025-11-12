// app/components/Sidebar.tsx

import React, { useState } from 'react';
import { Upload, Trash2, Download, FileText, ChevronDown, Globe, Loader2, Plus } from 'lucide-react';
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
  onExportJSON: () => void;
  onURLUpload: (svgData: UploadedSVG) => void;
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
  onExportJSON,
  onURLUpload,
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingURL, setIsLoadingURL] = useState(false);

  const handleURLSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoadingURL(true);
    try {
      const input = urlInput.trim();
      
      // Check if input is a data URI
      if (input.startsWith('data:')) {
        // Handle data URI
        const dataUriMatch = input.match(/^data:([^;]+);base64,(.+)$/);
        
        if (!dataUriMatch) {
          throw new Error('Invalid data URI format. Expected format: data:image/svg+xml;base64,...');
        }
        
        const mimeType = dataUriMatch[1];
        const base64Data = dataUriMatch[2];
        
        // Validate that it's SVG
        if (!mimeType.includes('svg')) {
          throw new Error('Data URI must contain SVG content (image/svg+xml)');
        }
        
        // Decode base64 to get SVG content
        let svgContent: string;
        try {
          svgContent = atob(base64Data);
        } catch (e) {
          throw new Error('Failed to decode base64 data. Please ensure the data URI is valid.');
        }
        
        // Validate that the decoded content is actually SVG
        if (!svgContent.includes('<svg')) {
          throw new Error('Decoded content does not contain valid SVG markup');
        }
        
        const newSVG: UploadedSVG = {
          id: Date.now() + Math.random(),
          name: `datauri-svg-${Date.now()}.svg`,
          content: svgContent,
          // No remoteUrl for data URIs
          remoteUrl: undefined,
        };
        
        onURLUpload(newSVG);
        setUrlInput(''); // Clear the input after successful upload
        
      } else {
        // Handle regular URL
        // Use our API route to fetch the SVG content (bypasses CORS)
        const response = await fetch('/api/fetch-svg', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: input }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        // Extract filename from URL or use a default name
        const urlObject = new URL(input);
        const pathSegments = urlObject.pathname.split('/');
        let filename = pathSegments[pathSegments.length - 1];
        
        // If no filename or it doesn't end with .svg, create a default name
        if (!filename || !filename.includes('.')) {
          filename = `remote-svg-${Date.now()}.svg`;
        } else if (!filename.endsWith('.svg')) {
          filename += '.svg';
        }
        
        const newSVG: UploadedSVG = {
          id: Date.now() + Math.random(),
          name: filename,
          content: data.content,
          remoteUrl: input,
        };
        
        onURLUpload(newSVG);
        setUrlInput(''); // Clear the input after successful upload
      }
      
    } catch (error) {
      console.error('Error processing SVG input:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to process SVG: ${errorMessage}`);
    } finally {
      setIsLoadingURL(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoadingURL) {
      handleURLSubmit();
    }
  };
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

      <div className="p-4 border-t border-gray-200 space-y-4">
        {/* URL Input Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add SVG from URL or Data URI
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="URL or data:image/svg+xml;base64,..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                disabled={isLoadingURL}
              />
            </div>
            <button
              onClick={handleURLSubmit}
              disabled={isLoadingURL || !urlInput.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors duration-200 flex items-center justify-center min-w-[40px]"
            >
              {isLoadingURL ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium"
            onClick={() => setShowExportOptions(!showExportOptions)}
          >
            <Download size={18} />
            Export
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showExportOptions ? 'rotate-180' : ''}`} 
            />
          </button>

          {showExportOptions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                onClick={() => {
                  onExport();
                  setShowExportOptions(false);
                }}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Export as SVG</div>
                  <div className="text-xs text-gray-500">Download merged SVG file</div>
                </div>
              </button>
              
              <div className="border-t border-gray-100"></div>
              
              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                onClick={() => {
                  onExportJSON();
                  setShowExportOptions(false);
                }}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Export as JSON</div>
                  <div className="text-xs text-gray-500">Download layout configuration</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};