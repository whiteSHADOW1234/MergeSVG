// app/utils/svgExport.ts

import { CanvasSVG, SVGDimensions, CanvasSize } from '../types/svg';
import { CanvasBackgroundConfig } from '../components/CanvasControlSidebar';

export const extractSVGDimensions = (svgContent: string): SVGDimensions => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  
  if (!svgElement) {
    return { width: 100, height: 100 };
  }
  
  // Prioritize width/height attributes over viewBox for display dimensions
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');
  
  if (widthAttr && heightAttr) {
    const width = parseFloat(widthAttr);
    const height = parseFloat(heightAttr);
    if (!isNaN(width) && !isNaN(height)) {
      return { width, height };
    }
  }
  
  // Fallback to viewBox if width/height not available
  if (svgElement.hasAttribute('viewBox')) {
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const [, , width, height] = viewBox.split(/[\s,]+/).map(Number);
      return { width: width || 100, height: height || 100 };
    }
  }
  
  return { width: 100, height: 100 };
};

const generateBackgroundElements = (canvasSize: CanvasSize, backgroundConfig: CanvasBackgroundConfig): string => {
  const { backgroundColor, transparency, pattern, gridSize, gridColor } = backgroundConfig;
  
  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const baseColor = hexToRgba(backgroundColor, transparency);
  let backgroundElements = '';

  // Add solid background rectangle
  backgroundElements += `<rect width="${canvasSize.width}" height="${canvasSize.height}" fill="${baseColor}"/>`;

  // Add pattern overlay if needed
  if (pattern !== 'none') {
    let patternDef = '';
    let patternRect = '';

    switch (pattern) {
      case 'grid':
        patternDef = `
  <defs>
    <pattern id="gridPattern" x="0" y="0" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <rect width="${gridSize}" height="${gridSize}" fill="none"/>
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${gridColor}" stroke-width="1"/>
    </pattern>
  </defs>`;
        patternRect = `<rect width="${canvasSize.width}" height="${canvasSize.height}" fill="url(#gridPattern)"/>`;
        break;
        
      case 'dots':
        patternDef = `
  <defs>
    <pattern id="dotsPattern" x="0" y="0" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <circle cx="${gridSize/2}" cy="${gridSize/2}" r="1" fill="${gridColor}"/>
    </pattern>
  </defs>`;
        patternRect = `<rect width="${canvasSize.width}" height="${canvasSize.height}" fill="url(#dotsPattern)"/>`;
        break;
        
      case 'checkerboard':
        const halfSize = gridSize / 2;
        patternDef = `
  <defs>
    <pattern id="checkerPattern" x="0" y="0" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <rect width="${halfSize}" height="${halfSize}" fill="#e5e7eb"/>
      <rect x="${halfSize}" y="${halfSize}" width="${halfSize}" height="${halfSize}" fill="#e5e7eb"/>
    </pattern>
  </defs>`;
        patternRect = `<rect width="${canvasSize.width}" height="${canvasSize.height}" fill="url(#checkerPattern)"/>`;
        break;
    }

    backgroundElements = patternDef + backgroundElements + patternRect;
  }

  return backgroundElements;
};

export const exportMergedSVG = (canvasSVGs: CanvasSVG[], canvasSize: CanvasSize, backgroundConfig?: CanvasBackgroundConfig): void => {
  if (canvasSVGs.length === 0) {
    alert('No SVGs on canvas to export');
    return;
  }

  const mergedContent = canvasSVGs.map((svg) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg.content, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) return '';
    
    // Get the original dimensions
    const originalDimensions = extractSVGDimensions(svg.content);
    
    // Calculate the scale factors based on current size vs original size
    const scaleX = svg.width / originalDimensions.width;
    const scaleY = svg.height / originalDimensions.height;
    
    // Clone the SVG element to modify it
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Remove any width/height attributes to prevent conflicts
    clonedSvg.removeAttribute('width');
    clonedSvg.removeAttribute('height');
    
    // Ensure we have a viewBox for proper scaling
    if (!clonedSvg.hasAttribute('viewBox')) {
      clonedSvg.setAttribute('viewBox', `0 0 ${originalDimensions.width} ${originalDimensions.height}`);
    }
    
    // Get the inner content (everything inside the <svg> tag)
    const innerContent = clonedSvg.innerHTML;
    
    // Create a group with translation and scaling transforms
    return `<g transform="translate(${svg.x},${svg.y}) scale(${scaleX},${scaleY})">
  <svg viewBox="0 0 ${originalDimensions.width} ${originalDimensions.height}" width="${originalDimensions.width}" height="${originalDimensions.height}">
    ${innerContent}
  </svg>
</g>`;
  }).join('\n');

  // Generate background if config is provided
  const backgroundElements = backgroundConfig 
    ? generateBackgroundElements(canvasSize, backgroundConfig)
    : '';

  const exportSVG = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize.width}" height="${canvasSize.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">
${backgroundElements}
${mergedContent}
</svg>`;

  const blob = new Blob([exportSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'merged.svg';
  a.click();
  URL.revokeObjectURL(url);
};