"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2, AlertTriangle, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// Remove Pyodide type definition
// type Pyodide = any;

interface PyodideRunnerProps {
  code: string;
  initialAutoRun?: boolean; // Optional: Run code automatically on load
}

export function PyodideRunner({ code, initialAutoRun = false }: PyodideRunnerProps) {
  // Remove pyodideInstance state
  // const [pyodideInstance, setPyodideInstance] = useState<Pyodide | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState<boolean>(false);
  const [isLoadingPyodide, setIsLoadingPyodide] = useState<boolean>(true); // Still track loading state reported by worker
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize worker
  useEffect(() => {
    console.log("[Runner] Initializing Pyodide Worker...");
    // Create worker instance
    // IMPORTANT: Make sure the path is correct relative to the public folder
    workerRef.current = new Worker('/pyodide-worker.js');
    setIsLoadingPyodide(true); // Assume loading until worker confirms
    setIsWorkerReady(false);

    // Handle messages from worker
    workerRef.current.onmessage = (event) => {
      const { type, status, data, error: workerError } = event.data;
      console.log("[Runner] Received message from worker:", type, status, data, workerError);

      if (type === 'status') {
        switch (status) {
          case 'ready':
            setIsLoadingPyodide(false);
            setIsWorkerReady(true);
            setError(null);
            console.log("[Runner] Worker reported Pyodide ready.");
            // Auto-run code if requested and worker is now ready
            if (initialAutoRun && workerRef.current) {
              console.log("[Runner] Triggering initial auto-run.");
              setOutput([]); // Clear any previous output
              setError(null);
              workerRef.current.postMessage({ code });
            }
            break;
          case 'executing':
            setIsExecuting(true);
            // Clear previous output/error for new execution
            // setOutput([]); 
            // setError(null);
            break;
          case 'executed':
            setIsExecuting(false);
            break;
          case 'error':
            setIsLoadingPyodide(false); // If loading fails
            setIsExecuting(false);
            setError(workerError || 'An unknown worker error occurred');
            break;
        }
      } else if (type === 'stdout') {
        setOutput((prev) => [...prev, data]);
      } else if (type === 'stderr') {
        // Prepend [Error] for clarity, though worker might already do it
        const message = data.startsWith('[Execution Error]') || data.startsWith('[Error]') 
                          ? data 
                          : `[Error] ${data}`;
        setOutput((prev) => [...prev, message]);
        // Optionally set the main error state as well, depending on desired UI
        // setError(data);
      }
    };

    // Handle worker errors (e.g., worker script not found)
    workerRef.current.onerror = (err) => {
      console.error("[Runner] Worker error:", err);
      setError(`Worker Error: ${err.message}`);
      setIsLoadingPyodide(false);
      setIsExecuting(false);
      setIsWorkerReady(false);
    };

    // Cleanup: Terminate worker when component unmounts
    return () => {
      console.log("[Runner] Terminating Pyodide Worker.");
      workerRef.current?.terminate();
      setIsWorkerReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Trigger auto-run only once after worker is ready
  // This effect is handled within the worker.onmessage 'ready' case now
  // useEffect(() => {
  //   if (initialAutoRun && isWorkerReady && workerRef.current) {
  //     console.log("[Runner] Triggering initial auto-run (effect).");
  //     handleRunCode();
  //   }
  // }, [initialAutoRun, isWorkerReady, handleRunCode]); // Removed handleRunCode from deps


  // --- Run Code --- 
  const handleRunCode = useCallback(() => {
    if (!workerRef.current || !isWorkerReady || isExecuting) {
      console.warn("[Runner] Run button clicked but worker not ready or already executing.");
      return;
    }
    console.log("[Runner] Sending code to worker for execution...");
    setOutput([]); // Clear previous output
    setError(null); // Clear previous error
    // setIsExecuting(true); // Worker will report 'executing' status
    workerRef.current.postMessage({ code });
  }, [code, isWorkerReady, isExecuting]); // Include dependencies

  // Remove the old useEffect for loading Pyodide directly
  // useEffect(() => { ... }, []);

  // Remove the old handleRunCode that used pyodideInstance
  // const handleRunCode = async (pyodide: Pyodide | null = pyodideInstance) => { ... };

  return (
    <div className="pyodide-runner my-2 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900">
      {/* Code Display Area */}
      <div className="code-display p-0 max-h-60 overflow-y-auto bg-neutral-900 dark:bg-black/50 relative scrollbar-thin">
        <SyntaxHighlighter
          language="python"
          // style={coldarkDark} // Assuming you might use a style later
          PreTag="div"
          className="text-xs !m-0 !p-3"
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
        {/* Run Button Overlay */}
        <div className="absolute top-1 right-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunCode} // Use the new worker-based function
            disabled={isLoadingPyodide || isExecuting || !isWorkerReady} // Disable if loading, executing, or worker not ready
            className="h-7 px-2 text-xs bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
          >
            {(isLoadingPyodide || isExecuting) ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Play className="h-3 w-3 mr-1" />
            )}
            {isLoadingPyodide ? 'Loading Env' : isExecuting ? 'Running' : 'Run'}
          </Button>
        </div>
      </div>

      {/* Output/Status Area */}
      {(output.length > 0 || error || isLoadingPyodide || (isExecuting && !isLoadingPyodide)) && (
        <div className="output-area p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          {isLoadingPyodide && (
            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Loading Python Environment (Worker)...
            </div>
          )}
          {!isLoadingPyodide && isExecuting && (
             <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Executing...
            </div>
          )}
          {error && (
            <div className="flex items-start text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" />
              <pre className="whitespace-pre-wrap font-mono flex-grow">{error}</pre>
            </div>
          )}
          {output.length > 0 && (
            <div className="output-content mt-1">
                <div className='flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-1'>
                     <Terminal className="h-3 w-3 mr-1.5 flex-shrink-0" /> Output:
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono bg-neutral-100 dark:bg-neutral-900 p-2 rounded max-h-48 overflow-y-auto scrollbar-thin">
                    {output.join('\n')}
                </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 