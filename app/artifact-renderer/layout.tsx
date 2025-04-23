import React from 'react';
import Script from 'next/script';

// Basic layout for the isolated artifact renderer iframe environment
export default function ArtifactRendererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Load React and ReactDOM globally for the dynamic artifact code */}
      {/* These need to be loaded in the <head>, but since layouts render */}
      {/* within <body> in Next.js 13+, we rely on `beforeInteractive` */}
      {/* to load them ASAP. Alternatively, place in <Head> component */}
      {/* if using one, but this simple layout doesn't need a full <head> */}
      <Script
        src="https://unpkg.com/react@18/umd/react.production.min.js"
        strategy="beforeInteractive" 
        id="react-global"
      />
      <Script
        src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
        strategy="beforeInteractive"
        id="react-dom-global"
      />
      {/* Render the actual page content */}
      {children}
      {/* Basic iframe body reset via style tag */}
      <style>{`body { margin: 0; padding: 0; background-color: transparent; }`}</style>
    </>
  );
} 