import React from 'react';
import { cn } from '@/lib/utils';

interface ArtifactRendererProps {
  content: string; // Contains HTML or SVG string
  type: 'html' | 'svg';
}

export function ArtifactRenderer({ content, type }: ArtifactRendererProps) {
  // Basic check for non-string content
  if (typeof content !== 'string') {
    console.error(`ArtifactRenderer received non-string content for type ${type}:`, content);
    return <div className="text-red-500 p-2">Error: Invalid artifact content.</div>; 
  }

  // Consider adding a loading state or placeholder if rendering is slow
  return (
    <iframe
      title={`Interactive Artifact (${type})`}
      srcDoc={content}
      // **IMPORTANT SECURITY**: Adjust sandbox as needed for artifact functionality
      // Start with the most restrictive and add permissions cautiously.
      // 'allow-scripts' is often needed for interactivity.
      // Avoid 'allow-same-origin' unless absolutely necessary and trusted.
      sandbox="allow-scripts" 
      className={cn(
        "w-full rounded-md overflow-hidden block", // Ensure it's a block element
        "aspect-video", // Default aspect ratio, adjust as needed
        "max-h-[60vh]", // Limit max height relative to viewport
        "bg-white dark:bg-neutral-100", // Background for the iframe content area
        "border border-neutral-300 dark:border-neutral-700" // Border around iframe
      )}
      // allowFullScreen // Optional: Add if artifacts need fullscreen capability
      // loading="lazy" // Optional: Defer loading until visible
    />
  );
} 