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

// Ensure the root <svg> has a proper viewBox and set explicit width/height.
// This avoids using CSS transforms which can break transform-origin in animations.
export const resizeRootSvgTo = (svgContent: string, targetWidth: number, targetHeight: number): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return svgContent;

    // Determine original dimensions
    const widthAttr = svg.getAttribute('width');
    const heightAttr = svg.getAttribute('height');

    let vb = svg.getAttribute('viewBox');
    if (!vb) {
      let ow = 0;
      let oh = 0;
      if (widthAttr && heightAttr) {
        ow = parseFloat(widthAttr);
        oh = parseFloat(heightAttr);
      } else {
        const dims = extractSVGDimensions(svgContent);
        ow = dims.width;
        oh = dims.height;
      }
      if (Number.isFinite(ow) && Number.isFinite(oh) && ow > 0 && oh > 0) {
        vb = `0 0 ${ow} ${oh}`;
        svg.setAttribute('viewBox', vb);
      }
    }

    // Set explicit size (in px)
    svg.setAttribute('width', String(targetWidth));
    svg.setAttribute('height', String(targetHeight));

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc.documentElement);
  } catch (_err) {
    return svgContent;
  }
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

  const mergedContent = canvasSVGs.map((item) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(item.content, 'image/svg+xml');
    const root = doc.querySelector('svg');
    if (!root) return '';

    // Extract original viewBox (including origin), or derive from width/height
    let viewBox = root.getAttribute('viewBox');
    if (!viewBox) {
      const dims = extractSVGDimensions(item.content);
      viewBox = `0 0 ${dims.width} ${dims.height}`;
    }

    // Preserve preserveAspectRatio if present
    const par = root.getAttribute('preserveAspectRatio');
    const preserve = par ? ` preserveAspectRatio="${par}"` : '';

    // Inner content of original SVG (keep <style>, animations, etc.)
    const inner = root.innerHTML;

    // Position with x/y, scale via width/height only – no transform
    // This preserves animation geometry and transform-origins.
    return `<svg x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" viewBox="${viewBox}"${preserve}>\n${inner}\n</svg>`;
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