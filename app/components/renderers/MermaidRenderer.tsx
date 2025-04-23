"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';

interface MermaidRendererProps {
  syntax: string;
}

// Initialize Mermaid (can be done once globally, but doing it here is safer for component scope)
// Using a simple configuration, customize as needed
mermaid.initialize({
  startOnLoad: false, // We manually render
  theme: 'neutral', // Options: default, forest, dark, neutral
  // securityLevel: 'strict', // Consider security implications if needed
  // Add other configurations like themeVariables if you want deep customization
});

export function MermaidRenderer({ syntax }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Generate a unique ID for each instance to avoid conflicts
  const [mermaidId] = useState(() => `mermaid-graph-${Math.random().toString(36).substring(2, 15)}`);

  useEffect(() => {
    setError(null); // Clear previous errors
    setSvgContent(null); // Clear previous content

    if (containerRef.current && syntax) {
      // Validate syntax before attempting to render (optional but recommended)
      try {
        mermaid.parse(syntax); // Throws error on invalid syntax
      } catch (e: unknown) { // Use unknown instead of any
        // Type check the error before accessing properties
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Mermaid syntax error:", e);
        setError(`Syntax Error: ${errorMessage || 'Invalid Mermaid diagram syntax.'}`);
        return; // Don't proceed if syntax is invalid
      }

      // Render the diagram - Treating synchronously based on TS error
      try {
        const svg = mermaid.render(mermaidId, syntax);
        // Check if render actually returned a string (as types suggest)
        if (typeof svg === 'string') {
            setSvgContent(svg);
        } else {
            // This case handles if the types are wrong and it's async or returns something else
            console.error("Mermaid render did not return a string synchronously as expected by types.", svg);
            // Attempting to handle as a promise just in case types are misleading
            Promise.resolve(svg) // Wrap whatever was returned
                .then((resolvedSvg: unknown) => { // Use unknown instead of any
                     // Check the type of the resolved value
                     if (typeof resolvedSvg === 'string') {
                        setSvgContent(resolvedSvg);
                     } else if (
                         typeof resolvedSvg === 'object' && 
                         resolvedSvg !== null && 
                         'svg' in resolvedSvg && // Type guard
                         typeof (resolvedSvg as { svg: unknown }).svg === 'string'
                     ) {
                         // Handle the { svg: string } case
                         setSvgContent((resolvedSvg as { svg: string }).svg);
                     } else {
                        throw new Error('Render promise resolved to unexpected value.');
                     }
                })
                .catch((err: Error) => { // Assume Error type for promise rejection
                    console.error("Mermaid rendering error (async fallback):", err);
                    setError("Failed to render diagram.");
                });
        }
      } catch (err: unknown) { // Use unknown instead of any
          // Type check the error
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error("Mermaid rendering error (sync catch):", err);
          setError(`Failed to render diagram: ${errorMessage}`);
      }
    }
  }, [syntax, mermaidId]); // Rerun effect if syntax changes

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "mermaid-container p-4 my-2 rounded-lg",
        // Style based on state
        !error && "bg-white dark:bg-neutral-100", // Background for valid diagrams
        error && "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
      )}
    >
      {error ? (
        <pre className="text-xs whitespace-pre-wrap font-mono">{error}</pre>
      ) : svgContent ? (
        // Render the generated SVG using dangerouslySetInnerHTML
        // This is generally safe as Mermaid generates SVG, not arbitrary HTML/script
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      ) : (
        // Placeholder/Loading state (optional)
        <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">Rendering diagram...</div>
      )}
      {/* Hidden div used by mermaid.render, content is extracted to state */}
      <div id={mermaidId} className="hidden" /> 
    </div>
  );
} 