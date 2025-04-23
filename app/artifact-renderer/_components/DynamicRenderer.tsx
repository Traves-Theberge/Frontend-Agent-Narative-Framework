'use client';

import React, { Suspense } from 'react';

interface DynamicRendererProps {
  // Use React.ComponentType which defaults props to 'any', suitable for generic renderer
  Component: React.ComponentType | null; 
}

function DynamicRendererLoading() {
    return <div className="text-muted-foreground italic">Loading artifact component...</div>;
}

export function DynamicRenderer({ Component }: DynamicRendererProps) {
  if (!Component) {
    return null; // Or a placeholder/error message
  }

  // Use React.Suspense in case the component itself uses lazy loading
  // Add an ErrorBoundary for better production stability
  return (
    <Suspense fallback={<DynamicRendererLoading />}>
        <Component />
    </Suspense>
  );
} 