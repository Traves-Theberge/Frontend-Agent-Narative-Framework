'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Define message types received from iframe
interface InitCompleteMessage {
    type: 'INIT_COMPLETE';
}

// REMOVE SelectionDataMessage
/*
interface SelectionDataMessage {
    type: 'SELECTION_DATA';
    payload: {
        imageDataUrl: string | null;
        error?: string;
    };
}
*/

// Adjust IframeMessage type
type IframeMessage = InitCompleteMessage; // Only InitComplete now

// Define message types sent to iframe
interface UpdateComponentMessage {
  type: 'UPDATE_COMPONENT';
  payload: {
    code: string;
  };
}

// REMOVE CaptureSelectionMessage
/*
interface CaptureSelectionMessage {
    type: 'CAPTURE_SELECTION';
    payload?: {
        selector?: string;
    };
}
*/

// Adjust ParentMessage type
type ParentMessage = UpdateComponentMessage; // Only UpdateComponent now

interface ArtifactViewerProps {
  code: string;
  className?: string;
}

const ArtifactViewerComponent = ({ code, className }: ArtifactViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const artifactCode = useRef<string>(code);
  // const [isCapturing, setIsCapturing] = useState(false); // REMOVE isCapturing state
  const [initialCodeSent, setInitialCodeSent] = useState(false);

  // ---- START DEBUG LOG ----
  console.log('[ArtifactViewer] Rendering component with code (start):', artifactCode.current.substring(0, 50) + '...');
  // ---- END DEBUG LOG ----

  // --- Mount/Unmount Logging ---
  useEffect(() => {
    console.log(`[ArtifactViewer MOUNT] Component mounted with code length: ${code?.length}`);
    setIframeReady(false);
    setIframeError(null);
    setInitialCodeSent(false);
    artifactCode.current = code;
    return () => {
      console.log(`[ArtifactViewer UNMOUNT] Component unmounting.`);
    };
  }, [code]);

  // --- Post Message TO Iframe ---
  const postMessageToIframe = useCallback((message: UpdateComponentMessage) => {
    if (iframeRef.current?.contentWindow) {
      console.log('[ArtifactViewer] Posting message to iframe:', message.type, message.payload);
      iframeRef.current.contentWindow.postMessage(message, '*');
    } else {
      console.warn('[ArtifactViewer] Cannot post message, iframe content window not available.');
      toast.error("Artifact Communication Error", { description: "Could not send data to the artifact renderer." });
      // setIsCapturing(false); // REMOVE this line
    }
  }, []);

  // --- Message Handler FROM Iframe ---
  useEffect(() => {
    console.log('[ArtifactViewer] Adding message listener for iframe communication.');

    const handleMessage = (event: MessageEvent<InitCompleteMessage>) => {
      const iframeSrc = iframeRef.current?.src;
      if (!iframeSrc) {
         console.warn('[ArtifactViewer] Received message but iframe src is not set. Ignoring.');
         return;
      }

      try {
        void new URL(iframeSrc).origin; // Use void to indicate result is intentionally unused
      } catch /* e */ {
        console.error("[ArtifactViewer] Invalid iframe src URL:", iframeSrc);
        return;
      }

      // Relaxed origin check for simplicity during debugging, tighten later
      // if (event.origin !== allowedOrigin) {
      //   return;
      // }
      if (event.source !== iframeRef.current?.contentWindow) {
          // Ensure message is actually from our iframe's content window
          return;
      }

      console.log('[ArtifactViewer] Received message from iframe:', event.data.type, event.data);

      switch (event.data.type) {
        case 'INIT_COMPLETE':
          console.log('[ArtifactViewer] Iframe reported INIT_COMPLETE. Setting ready state.');
          setIframeReady(true);
          setIframeError(null);
          break;
        // REMOVE SELECTION_DATA case
        /*
        case 'SELECTION_DATA':
          console.log('[ArtifactViewer] Received SELECTION_DATA from iframe.', event.data.payload);
          // setIsCapturing(false);
          // ... toast/download logic ...
          break;
        */
        default:
          // Handle potentially unknown message types if necessary, or assert never
          // const _exhaustiveCheck: never = event.data;
          console.warn('[ArtifactViewer] Received unknown message type from iframe:', (event.data as any)?.type);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
       console.log('[ArtifactViewer] Removing message listener.');
      window.removeEventListener('message', handleMessage);
    };
  }, []); // Run only once on mount

  // Effect to send code update if the code prop changes OR if iframe just became ready
  useEffect(() => {
    console.log(`[ArtifactViewer] Code prop effect triggered. iframeReady: ${iframeReady}, initialCodeSent: ${initialCodeSent}, Code prop length: ${code?.length}, Current ref code length: ${artifactCode.current?.length}`);

    if (iframeReady && code) {
      // Send code if:
      // 1. iframe is ready AND initial code hasn't been sent yet
      // OR
      // 2. The code prop has actually changed from what's currently in the ref
      const shouldSendCode = !initialCodeSent || code !== artifactCode.current;

      if (shouldSendCode) {
         console.log(`[ArtifactViewer] Sending UPDATE_COMPONENT (${!initialCodeSent ? 'Initial' : 'Changed'}).`);
         artifactCode.current = code; // Update the ref *now* to reflect sent code
         setIframeError(null); // Clear any previous error
         postMessageToIframe({ type: 'UPDATE_COMPONENT', payload: { code } });
         if (!initialCodeSent) {
           setInitialCodeSent(true); // Mark initial code as sent *after* successful post attempt
         }
      } else {
          console.log('[ArtifactViewer] Code prop effect triggered but code is the same as current ref. No update sent.');
      }
    } else if (!iframeReady) {
        console.log('[ArtifactViewer] Code prop effect triggered but iframe NOT ready. No update sent.');
    } else if (!code) {
         console.log('[ArtifactViewer] Code prop effect triggered but code is empty. No update sent.');
    }
  }, [code, iframeReady, postMessageToIframe, initialCodeSent]);

  // --- Iframe onLoad and onError handlers ---
  const handleIframeLoad = () => {
     console.log('[ArtifactViewer] Iframe onLoad event triggered.');
     // The INIT_COMPLETE message is the true indicator of readiness
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleIframeError = (_: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
      console.error("[ArtifactViewer] Iframe onError event triggered:");
      setIframeError("Failed to load the artifact renderer frame.");
      setIframeReady(false);
      setInitialCodeSent(false); // Reset flag on error
      toast.error("Artifact Load Error", { description: "Could not load the artifact renderer component." });
  };

  return (
    <div className={cn("artifact-viewer-container border rounded-md overflow-hidden relative bg-muted/20", className)}>
      {!iframeReady && !iframeError && (
         <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <Skeleton className="h-full w-full" />
            <p className="absolute text-muted-foreground text-sm">Loading Artifact Renderer...</p>
         </div>
      )}
      {iframeError && (
           <div className="absolute inset-0 flex items-center justify-center p-4 bg-destructive/10">
              <p className="text-destructive text-sm font-medium text-center">Error:<br />{iframeError}</p>
           </div>
      )}
      <iframe
        ref={iframeRef}
        src="/artifact-renderer.html"
        title="Artifact Renderer"
        className={cn(
            "w-full h-[400px] border-0 transition-opacity duration-300",
            iframeReady ? "opacity-100" : "opacity-0",
            iframeError ? "opacity-0" : ""
        )}
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
}

// --- Export the memoized version --- 
export const ArtifactViewer = React.memo(ArtifactViewerComponent);

// Add display name for easier debugging
ArtifactViewer.displayName = 'ArtifactViewer'; 