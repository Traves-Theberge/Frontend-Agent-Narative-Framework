'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { DynamicRenderer } from './_components/DynamicRenderer';
import { ArtifactErrorBoundary } from './_components/ErrorBoundary';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"; 

// --- Parent Message Types ---
interface UpdateComponentMessage { type: 'UPDATE_COMPONENT'; payload: { code: string; }; }
interface CaptureSelectionMessage { type: 'CAPTURE_SELECTION'; payload?: { selector?: string; }; }
type ParentMessage = UpdateComponentMessage | CaptureSelectionMessage;

// --- Iframe Message Types ---
interface InitCompleteMessage { type: 'INIT_COMPLETE'; }
interface SelectionDataMessage { type: 'SELECTION_DATA'; payload: { imageDataUrl: string | null; error?: string; }; }
type IframeMessage = InitCompleteMessage | SelectionDataMessage;

// --- Worker Message Types ---
interface WorkerTransformSuccessMessage { type: 'TRANSFORM_SUCCESS'; payload: { transformedCode: string }; }
interface WorkerTransformErrorMessage { type: 'TRANSFORM_ERROR'; payload: { error: string }; }
type WorkerIncomingMessage = WorkerTransformSuccessMessage | WorkerTransformErrorMessage;

export default function ArtifactRendererPage() {
  // --- Initial Log ---
  console.log('[RendererPage LOG] ArtifactRendererPage function component body executing.');
  // --- End Initial Log ---

  const [componentCode, setComponentCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [RenderedComponent, setRenderedComponent] = useState<React.ComponentType | null>(null);
  const parentOrigin = useRef<string | null>(null);
  const rendererRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('[RendererPage] Component rendering/re-rendering (Full).');

  // --- Attempt to disable Dev Overlay in iframe ---
  useEffect(() => {
    // Run this check only in development environment
    if (process.env.NODE_ENV === 'development') {
      // The overlay is usually added as a direct child of <body> or via a portal
      // Try to find common selectors used by Next.js dev overlay
      try {
        const overlayRoot = document.querySelector('nextjs-portal'); // Common portal selector
        const legacyOverlay = document.querySelector('#__next_error__'); // Older overlay selector
        const specificOverlay = document.querySelector('[data-nextjs-react-dev-overlay]'); // Data attribute selector

        if (overlayRoot) {
            console.log('[RendererPage DevCheck] Found nextjs-portal, hiding.');
            (overlayRoot as HTMLElement).style.display = 'none';
        }
        if (legacyOverlay) {
            console.log('[RendererPage DevCheck] Found __next_error__, hiding.');
            (legacyOverlay as HTMLElement).style.display = 'none';
        }
         if (specificOverlay) {
            console.log('[RendererPage DevCheck] Found data-nextjs-react-dev-overlay, hiding.');
            (specificOverlay as HTMLElement).style.display = 'none';
        }
        // Also try removing event listeners that might cause issues - more complex/risky
      } catch (err) {
        console.warn('[RendererPage DevCheck] Error trying to find/hide dev overlay:', err);
      }
    }
  }, []); // Run only once on mount

  // --- Expose necessary components globally for artifact code ---
  useEffect(() => {
    // These components are used directly by name in the artifact code
    // without explicit imports, so we need them on the window scope.
    // @ts-expect-error - Assigning to window for dynamic artifact scope - REMOVED
    window.Button = Button;
    // @ts-expect-error - Assigning to window for dynamic artifact scope - REMOVED
    window.Input = Input;
    // @ts-expect-error - Assigning to window for dynamic artifact scope - REMOVED
    window.useState = useState; // Also expose useState just in case
    // @ts-expect-error - Assigning to window for dynamic artifact scope - REMOVED
    window.useCallback = useCallback; // And useCallback
    // @ts-expect-error - Assigning to window for dynamic artifact scope - REMOVED
    window.useEffect = useEffect; // And useEffect
    // @ts-expect-error - Assigning to window for dynamic artifact scope - REMOVED
    window.useRef = useRef; // And useRef
    console.log('[RendererPage] Exposed Button, Input, and React hooks globally on window.');

    // Optional: Cleanup function to remove them on unmount
    return () => {
      try {
        // @ts-expect-error - Deleting from window scope - REMOVED
        delete window.Button;
        // @ts-expect-error - Deleting from window scope - REMOVED
        delete window.Input;
        // @ts-expect-error - Deleting from window scope - REMOVED
        delete window.useState;
        // @ts-expect-error - Deleting from window scope - REMOVED
        delete window.useCallback;
        // @ts-expect-error - Deleting from window scope - REMOVED
        delete window.useEffect;
        // @ts-expect-error - Deleting from window scope - REMOVED
        delete window.useRef;
      } catch (error) {
        console.warn('[RendererPage] Could not clean up global components:', error);
      }
    };
  }, []); // Run only once on component mount

  // --- Initialize Worker ---
  useEffect(() => {
    console.log('[RendererPage] Attempting to initialize worker (Full).');
    workerRef.current = new Worker('/artifact-worker.js');
    console.log('[RendererPage] Worker instance created.');

    // --- Worker Message Handler ---
    const handleWorkerMessage = async (event: MessageEvent<WorkerIncomingMessage>) => {
      console.log('[RendererPage] Received message from worker:', event.data.type);
      setIsProcessing(false); 

      switch (event.data.type) {
        case 'TRANSFORM_SUCCESS':
          try {
            console.log('[RendererPage] Worker transform succeeded. Creating Blob URL...');
            const transformedCode = event.data.payload.transformedCode;
            
            // --- Blob URL and Dynamic Import --- 
            // Add necessary polyfills/globals if needed directly in the code string, 
            // or ensure they are globally available in the iframe context.
            // Note: This approach makes passing scope variables like Button/Input harder.
            // They would need to be globally available (e.g., window.Button = Button) or 
            // the worker needs to rewrite imports to fetch them from a known location.
            // For now, assume React is globally available via script tag in the iframe's HTML.
            
            const blob = new Blob([transformedCode], { type: 'text/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            let component = null;

            // --- Wait for React to be globally available --- 
            const waitForReact = async (timeout = 2000) => {
              const start = Date.now();
              while (!window.React && Date.now() - start < timeout) {
                console.log('[RendererPage] Waiting for window.React...');
                await new Promise(resolve => setTimeout(resolve, 50)); // Poll every 50ms
              }
              if (!window.React) {
                throw new Error('window.React did not become available in time.');
              }
              console.log('[RendererPage] window.React is available.');
            };

            try {
              await waitForReact(); // Wait before importing

              console.log(`[RendererPage] Dynamically importing from Blob URL: ${blobUrl}`);
              // Use /* webpackIgnore: true */ to prevent webpack warnings/errors
              const artifactModule = await import(/* webpackIgnore: true */ blobUrl);
              console.log('[RendererPage] Blob import successful. Module:', artifactModule);
              component = artifactModule.default;
              if (!component || typeof component !== 'function') {
                 throw new Error('Blob import did not result in a valid default export component.');
              }
            } finally {
                // Revoke the Blob URL after import attempt
                URL.revokeObjectURL(blobUrl);
                console.log(`[RendererPage] Revoked Blob URL: ${blobUrl}`);
            }
            // --- End Blob URL and Dynamic Import ---

            console.log('[RendererPage] Setting component state from Blob import.');
            setRenderedComponent(() => component); // Use function form for safety
            setError(null);
            toast.success("Artifact Rendered");

          } catch (evalError: unknown) {
            console.error('[RendererPage] Error importing/evaluating code from worker via Blob:', evalError);
            const errorMessage = `Failed to load artifact: ${evalError instanceof Error ? evalError.message : String(evalError)}`;
            setError(errorMessage);
            toast.error("Artifact Error", { description: errorMessage });
            setRenderedComponent(null);
          }
          break;
        case 'TRANSFORM_ERROR':
          console.error('[RendererPage] Error transforming code in worker:', event.data.payload.error);
          const transformErrorMessage = `Failed to process artifact: ${event.data.payload.error}`;
          setError(transformErrorMessage);
          toast.error("Artifact Error", { description: transformErrorMessage });
          setRenderedComponent(null);
          break;
        default:
             console.warn('[RendererPage] Received unknown message type from worker:', event.data);
      }
    };

    workerRef.current.addEventListener('message', handleWorkerMessage);
    console.log('[RendererPage] Added worker message listener.');

    // Cleanup: terminate worker when component unmounts
    return () => {
      console.log('[RendererPage] Terminating worker.');
      workerRef.current?.removeEventListener('message', handleWorkerMessage);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []); // Run only once on mount

  // --- Post Message TO Parent ---
  const postMessageToParent = useCallback((message: IframeMessage) => {
    if (parentOrigin.current) {
       if ('payload' in message) {
           console.log('[RendererPage] Posting message to parent:', message.type, message.payload);
       } else {
            console.log('[RendererPage] Posting message to parent:', message.type);
       }
      window.parent.postMessage(message, parentOrigin.current);
    } else {
      // Note: This might log during initial load before parent origin is set
      console.warn('[RendererPage] Cannot post message to parent, origin not set yet.');
    }
  }, []);

  // --- Capture Function ---
  const captureElement = useCallback(async (selector?: string) => {
    let elementToCapture: HTMLElement | null = rendererRef.current;
    console.log(`[RendererPage] Capture requested. Selector: "${selector || 'full'}", Target Element:`, elementToCapture);

    if (selector && rendererRef.current) {
        try {
            const selectedElement = rendererRef.current.querySelector(selector);
            if (selectedElement instanceof HTMLElement) {
                elementToCapture = selectedElement;
            } else {
                throw new Error(`Selector "${selector}" did not match a valid HTML element.`);
            }
        } catch (err: unknown) {
             postMessageToParent({
                type: 'SELECTION_DATA',
                payload: { imageDataUrl: null, error: `Capture failed: Invalid selector - ${err instanceof Error ? err.message : String(err)}` }
            });
            return;
        }
    }

    if (!elementToCapture) {
      postMessageToParent({
        type: 'SELECTION_DATA',
        payload: { imageDataUrl: null, error: 'Capture failed: Target element not found.' }
      });
      return;
    }

    try {
        const canvas = await html2canvas(elementToCapture as HTMLElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: process.env.NODE_ENV !== 'production',
        });
        const imageDataUrl = canvas.toDataURL('image/png');
        const successPayload: SelectionDataMessage['payload'] = { imageDataUrl: imageDataUrl };
        postMessageToParent({
            type: 'SELECTION_DATA',
            payload: successPayload
        });
    } catch (err: unknown) {
        console.error('[RendererPage] html2canvas capture error:', err);
        const errorMessage = `Capture failed: ${err instanceof Error ? err.message : String(err)}`;
        const errorPayload: SelectionDataMessage['payload'] = { imageDataUrl: null, error: errorMessage || 'Unknown capture error' };
        postMessageToParent({
            type: 'SELECTION_DATA',
            payload: errorPayload
        });
    }
}, [postMessageToParent]);


  // --- Message Handler FROM Parent ---
  useEffect(() => {
    console.log('[RendererPage] Adding parent message listener.');
    const handleParentMessage = (event: MessageEvent<ParentMessage>) => {
      const allowedOrigin = process.env.NODE_ENV === 'production'
         ? process.env.NEXT_PUBLIC_PARENT_APP_URL // Needs env var configured!
         : '*';

      if (allowedOrigin !== '*' && event.origin !== allowedOrigin) {
        console.warn(`[RendererPage] Ignoring message from disallowed parent origin: ${event.origin}`);
        return;
      }

      console.log('[RendererPage] Received message from parent:', event.data.type);

       if (!parentOrigin.current && event.data.type === 'UPDATE_COMPONENT') {
           // Store parent origin on first valid component update message
           if (allowedOrigin === '*' || event.origin === allowedOrigin) {
               parentOrigin.current = event.origin;
               console.log(`[RendererPage] Stored parent origin: ${parentOrigin.current}`);
           }
       }

      switch (event.data.type) {
        case 'UPDATE_COMPONENT':
          setError(null);
          setRenderedComponent(null);
          setIsProcessing(true);
          setComponentCode(event.data.payload.code);
          if (workerRef.current) {
            console.log('[RendererPage] Posting TRANSFORM_CODE message to worker.');
            workerRef.current.postMessage({ type: 'TRANSFORM_CODE', payload: { code: event.data.payload.code } });
          } else {
             const errorMsg = '[RendererPage] Worker not initialized when receiving UPDATE_COMPONENT.';
             console.error(errorMsg);
             setError(errorMsg);
             toast.error("Artifact Error", { description: errorMsg });
             setIsProcessing(false);
          }
          break;
        case 'CAPTURE_SELECTION':
          toast.info("Capture requested...");
          captureElement(event.data.payload?.selector).catch(err => {
               console.error('[RendererPage] Error during captureElement execution:', err);
               postMessageToParent({
                    type: 'SELECTION_DATA',
                    payload: { imageDataUrl: null, error: 'Internal capture error occurred.' }
               });
          });
          break;
        default:
          console.warn('[RendererPage] Received unknown message type from parent:', event.data);
      }
    };

    window.addEventListener('message', handleParentMessage);

    // Send INIT_COMPLETE (still needed for parent)
    const timer = setTimeout(() => {
      console.log('[RendererPage] Sending INIT_COMPLETE to parent window.');
      window.parent.postMessage({ type: 'INIT_COMPLETE' }, '*');
    }, 100);

    return () => {
      console.log('[RendererPage] Removing parent message listener.');
      window.removeEventListener('message', handleParentMessage);
      clearTimeout(timer);
    };
  }, [postMessageToParent, captureElement]); // Dependencies

  // --- Render Logic ---
  return (
      <div className="artifact-renderer h-full w-full p-4 bg-background text-foreground overflow-auto">
           {/* Add global style to prevent font loading issues */}
          <style jsx global>{`
            body, html {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            }
          `}</style>
          <div ref={rendererRef}>
              {isProcessing && (
                  <p className="text-muted-foreground italic">Processing artifact code...</p>
              )}
              {error && (
                  <div className="text-destructive bg-destructive/10 p-3 rounded border border-destructive">
                      <p className="font-bold">Rendering Error:</p>
                      <pre className="text-xs whitespace-pre-wrap">{error}</pre>
                  </div>
              )}
              {/* Render Component only when not processing, no error, and Component exists */}
              {!isProcessing && !error && RenderedComponent && (
                  <ArtifactErrorBoundary>
                      <DynamicRenderer Component={RenderedComponent} />
                  </ArtifactErrorBoundary>
              )}
              {/* Placeholder when waiting for initial code */}
              {!isProcessing && !error && !RenderedComponent && !componentCode && (
                  <p className="text-muted-foreground italic">Waiting for artifact code...</p>
              )}
          </div>
      </div>
  );
} 