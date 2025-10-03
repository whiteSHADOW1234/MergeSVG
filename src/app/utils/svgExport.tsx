// app/utils/svgExport.ts

import { CanvasSVG, SVGDimensions, CanvasSize } from '../types/svg';

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

export const exportMergedSVG = (canvasSVGs: CanvasSVG[], canvasSize: CanvasSize): void => {
  if (canvasSVGs.length === 0) {
    alert('No SVGs on canvas to export');
    return;
  }

  const mergedContent = canvasSVGs.map((svg) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg.content, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) return '';
    
    // Get the original viewBox or dimensions
    const viewBox = svgElement.getAttribute('viewBox');
    const originalDimensions = extractSVGDimensions(svg.content);
    
    // Calculate the scale based on current size vs original size
    const scaleX = svg.width / originalDimensions.width;
    const scaleY = svg.height / originalDimensions.height;
    
    // Clone the SVG element to modify it
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Set explicit width and height to match the canvas size
    clonedSvg.setAttribute('width', svg.width.toString());
    clonedSvg.setAttribute('height', svg.height.toString());
    
    // Keep the viewBox if it exists for proper scaling
    if (viewBox) {
      clonedSvg.setAttribute('viewBox', viewBox);
    }
    
    // Wrap in a group with translation only (scaling is handled by SVG's width/height + viewBox)
    const innerContent = clonedSvg.outerHTML;
    
    return `<g transform="translate(${svg.x},${svg.y})">\n${innerContent}\n</g>`;
  }).join('\n');

  const exportSVG = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize.width}" height="${canvasSize.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">
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