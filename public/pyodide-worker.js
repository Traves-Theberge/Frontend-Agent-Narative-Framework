// public/pyodide-worker.js

// Global variable to hold the Pyodide instance
let pyodide = null;
const pyodideVersion = "v0.26.1"; // Or your desired version
const pyodideIndexURL = `https://cdn.jsdelivr.net/pyodide/${pyodideVersion}/full/`;

// Track the messageId of the currently executing code
let currentExecutionMessageId = null;

// Import the main Pyodide script
// importScripts is synchronous and specific to Web Workers
console.log("[Worker] Loading Pyodide...");
self.importScripts(`${pyodideIndexURL}pyodide.js`);

async function loadPyodideAndPackages() {
  try {
    pyodide = await self.loadPyodide({
      indexURL: pyodideIndexURL,
    });
    console.log("[Worker] Pyodide loaded successfully.");

    // Set up stdout and stderr redirection to include messageId
    pyodide.setStdout({
      batched: (lines) => {
        if (currentExecutionMessageId) {
          self.postMessage({ type: 'stdout', data: lines, messageId: currentExecutionMessageId });
        }
      }
    });
    pyodide.setStderr({
      batched: (lines) => {
        if (currentExecutionMessageId) {
          self.postMessage({ type: 'stderr', data: lines, messageId: currentExecutionMessageId });
        }
      }
    });

    // Send initial ready status (no messageId needed)
    self.postMessage({ type: 'status', status: 'ready' });

  } catch (error) {
    console.error("[Worker] Pyodide loading failed:", error);
    // Send error status (no messageId needed for init failure)
    self.postMessage({ type: 'status', status: 'error', error: error.message });
  }
}

// Load Pyodide immediately when the worker starts
const pyodidePromise = loadPyodideAndPackages();

// Listen for messages from the main thread
self.onmessage = async (event) => {
  await pyodidePromise; // Ensure Pyodide is loaded before handling messages

  if (!pyodide) {
    console.error("[Worker] Pyodide not loaded, cannot execute code.");
    self.postMessage({ type: 'status', status: 'error', error: 'Pyodide failed to load.' });
    return;
  }

  // Destructure code and messageId from the payload
  const { code, messageId } = event.data;

  if (typeof code !== 'string' || typeof messageId !== 'string') {
    console.error("[Worker] Received invalid message format.", event.data);
    // Optionally send an error back associated with a default ID or log differently
    return;
  }

  console.log(`[Worker] Received code execution request for messageId: ${messageId}`);
  currentExecutionMessageId = messageId; // Set the current ID for stdout/stderr
  self.postMessage({ type: 'status', status: 'executing', messageId: messageId });

  try {
    console.log(`[Worker] Executing code for ${messageId}:
${code}`);
    await pyodide.runPythonAsync(code);
    console.log(`[Worker] Code execution finished for ${messageId}.`);
    self.postMessage({ type: 'status', status: 'executed', messageId: messageId });
  } catch (error) {
    console.error(`[Worker] Python execution error for ${messageId}:`, error);
    // Send error status back with the messageId
    self.postMessage({ type: 'status', status: 'error', error: error.message, messageId: messageId });
    // Also send the error message itself to stderr stream
    self.postMessage({ type: 'stderr', data: [`[Execution Error] ${error.message}`], messageId: messageId });
  } finally {
    currentExecutionMessageId = null; // Clear the ID after execution finishes or errors
  }
};

console.log("[Worker] Worker initialized, waiting for Pyodide load."); 