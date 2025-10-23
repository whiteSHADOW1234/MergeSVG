// app/api/fetch-svg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate that the URL is a valid HTTP/HTTPS URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Add common headers that might be required by some services
    const headers: Record<string, string> = {
      'User-Agent': 'MergeSVG/1.0 (+https://github.com/whiteSHADOW1234/MergeSVG)',
      'Accept': 'image/svg+xml,text/plain,*/*',
    };

    // Special handling for GitHub URLs
    if (validUrl.hostname.includes('github')) {
      headers['Accept'] = 'application/vnd.github.v3.raw';
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const svgContent = await response.text();

    // Basic SVG validation
    if (!svgContent.trim()) {
      return NextResponse.json(
        { error: 'Empty response from URL' },
        { status: 400 }
      );
    }

    // Check if content looks like SVG
    const trimmedContent = svgContent.trim();
    const isSVG = trimmedContent.includes('<svg') || 
                  trimmedContent.startsWith('<?xml') && trimmedContent.includes('<svg') ||
                  contentType.includes('svg');

    if (!isSVG) {
      return NextResponse.json(
        { error: 'URL does not contain valid SVG content' },
        { status: 400 }
      );
    }

    // Return the SVG content with proper headers
    return NextResponse.json({
      content: svgContent,
      contentType: contentType,
      url: url
    });

  } catch (error) {
    console.error('Error fetching SVG:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json(
          { error: 'Request timeout - URL took too long to respond' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch SVG: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the SVG' },
      { status: 500 }
    );
  }
}