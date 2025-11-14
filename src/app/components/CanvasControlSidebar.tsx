// app/components/CanvasControlSidebar.tsx

import React, { useState, useEffect } from 'react';
import { Palette, Grid, Layers, Star, Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export interface CanvasBackgroundConfig {
  backgroundColor: string;
  transparency: number;
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  pattern: 'none' | 'dots' | 'grid' | 'checkerboard';
}

interface CanvasControlSidebarProps {
  config: CanvasBackgroundConfig;
  onConfigChange: (config: CanvasBackgroundConfig) => void;
}

export const CanvasControlSidebar: React.FC<CanvasControlSidebarProps> = ({
  config,
  onConfigChange,
}) => {
  const [starCount, setStarCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (updates: Partial<CanvasBackgroundConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  // Fetch GitHub star count
  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/whiteSHADOW1234/MergeSVG');
        const data = await response.json();
        setStarCount(data.stargazers_count);
      } catch (error) {
        console.log('Failed to fetch star count:', error);
        setStarCount(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStarCount();
  }, []);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-xl">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Image 
              src="/icon.svg" 
              alt="MergeSVG Logo" 
              width={24} 
              height={24}
              className="w-6 h-6 -translate-y-[3px]"
            />
            MergeSVG
          </h2>
          
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/whiteSHADOW1234/MergeSVG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 hover:border-gray-400 hover:shadow-sm rounded-lg transition-all duration-200 group"
              title="View on GitHub"
            >
              <Github 
                size={14} 
                className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200" 
              />
              <span className="text-gray-700 font-medium text-xs">
                Code
              </span>
            </a>
            
            <a
              href="https://github.com/whiteSHADOW1234/MergeSVG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 hover:border-gray-400 hover:shadow-sm rounded-lg transition-all duration-200 group"
              title="Star on GitHub"
            >
              <Star 
                size={14} 
                className="text-gray-600 group-hover:text-yellow-500 transition-colors duration-200" 
                fill="currentColor"
              />
              {isLoading ? (
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="text-gray-700 font-medium text-xs">
                  {starCount !== null ? starCount : '0'}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Background Color */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Palette size={16} />
            Background Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => handleChange({ backgroundColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={config.backgroundColor}
              onChange={(e) => handleChange({ backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Transparency */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers size={16} />
              Transparency
            </span>
            <span className="text-xs font-normal text-gray-500">
              {Math.round(config.transparency * 100)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={config.transparency}
            onChange={(e) => handleChange({ transparency: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${config.transparency * 100}%, #e5e7eb ${config.transparency * 100}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Transparent</span>
            <span>Opaque</span>
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Grid size={16} />
            Background Pattern
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'dots', 'grid', 'checkerboard'] as const).map((pattern) => (
              <button
                key={pattern}
                onClick={() => handleChange({ pattern })}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors capitalize ${
                  config.pattern === pattern
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Settings (shown when pattern is grid or dots) */}
        {(config.pattern === 'grid' || config.pattern === 'dots') && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>Grid Size</span>
                <span className="text-xs font-normal text-gray-500">
                  {config.gridSize}px
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={config.gridSize}
                onChange={(e) => handleChange({ gridSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((config.gridSize - 5) / (50 - 5)) * 100}%, #e5e7eb ${((config.gridSize - 5) / (50 - 5)) * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Grid Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={config.gridColor}
                  onChange={(e) => handleChange({ gridColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.gridColor}
                  onChange={(e) => handleChange({ gridColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="#e5e7eb"
                />
              </div>
            </div>
          </>
        )}

        {/* Checkerboard Size (shown when pattern is checkerboard) */}
        {config.pattern === 'checkerboard' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>Checkerboard Size</span>
              <span className="text-xs font-normal text-gray-500">
                {config.gridSize}px
              </span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={config.gridSize}
              onChange={(e) => handleChange({ gridSize: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((config.gridSize - 10) / (100 - 10)) * 100}%, #e5e7eb ${((config.gridSize - 10) / (100 - 10)) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>
        )}

        {/* Preset Backgrounds */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <label className="text-sm font-semibold text-gray-700">
            Quick Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleChange({
                backgroundColor: '#ffffff',
                transparency: 1,
                pattern: 'none',
              })}
              className="h-12 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
              style={{ backgroundColor: '#ffffff' }}
              title="White"
            />
            <button
              onClick={() => handleChange({
                backgroundColor: '#000000',
                transparency: 1,
                pattern: 'none',
              })}
              className="h-12 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
              style={{ backgroundColor: '#000000' }}
              title="Black"
            />
            <button
              onClick={() => handleChange({
                backgroundColor: '#f3f4f6',
                transparency: 1,
                pattern: 'none',
              })}
              className="h-12 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
              style={{ backgroundColor: '#f3f4f6' }}
              title="Gray"
            />
            <button
              onClick={() => handleChange({
                backgroundColor: '#ffffff',
                transparency: 1,
                pattern: 'grid',
                gridSize: 20,
                gridColor: '#e5e7eb',
              })}
              className="h-12 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors bg-white"
              title="White with Grid"
            >
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }} />
            </button>
            <button
              onClick={() => handleChange({
                backgroundColor: '#ffffff',
                transparency: 1,
                pattern: 'checkerboard',
                gridSize: 20,
              })}
              className="h-12 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
              title="Checkerboard"
            >
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }} />
            </button>
            <button
              onClick={() => handleChange({
                backgroundColor: '#ffffff',
                transparency: 0,
                pattern: 'checkerboard',
                gridSize: 10,
              })}
              className="h-12 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
              title="Transparent"
            >
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                `,
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
              }} />
            </button>
          </div>
        </div>

        {/* Related Projects */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <label className="text-sm font-semibold text-gray-700">
            Related Projects
          </label>
          
          <a
            href="https://github.com/whiteSHADOW1234/UnBreakableSVG"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-900 rounded-lg transition-all duration-200 group hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg overflow-hidden relative">
                <Image
                  src="/UnBreakableSVG.svg"
                  alt="UnBreakableSVG Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-sm font-semibold text-white">
                UnBreakableSVG
              </h3>
            </div>
            <ExternalLink 
              size={16} 
              className="text-gray-400 group-hover:text-white transition-colors duration-200" 
            />
          </a>
        </div>
      </div>
    </div>
  );
};
