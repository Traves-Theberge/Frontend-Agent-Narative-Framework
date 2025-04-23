// public/artifact-worker.js

let babelLoadAttempted = false;
let babelLoaded = false;
const transpilationCache = new Map(); // Cache for transpiled code

async function ensureBabelLoaded() {
  if (babelLoaded) return true;
  if (babelLoadAttempted) {
    // Avoid repeated attempts if the first one failed
    return typeof self.Babel !== 'undefined';
  }
  babelLoadAttempted = true;

  try {
    if (typeof self.Babel === 'undefined') {
      console.log('[Worker] Babel not found, attempting to load from CDN...');
      self.importScripts('https://unpkg.com/@babel/standalone/babel.min.js');
      console.log('[Worker] Babel loaded via importScripts.');
      babelLoaded = true;
      return true;
    } else {
      babelLoaded = true; // Already loaded
      return true;
    }
  } catch (error) {
    console.error('[Worker] Failed to load Babel via importScripts:', error);
    self.postMessage({
        type: 'TRANSFORM_ERROR',
        payload: { error: 'Worker critical failure: Could not load Babel.' }
    });
    return false;
  }
}

// Listener for messages from the main renderer page thread
self.onmessage = async (event) => {
  const { type, payload } = event.data;
  console.log('[Worker] Received message:', { type, payload: payload?.code?.substring(0, 50) + '...' || 'N/A' });

  if (type === 'TRANSFORM_CODE') {
    const codeString = payload.code;

    // Check cache first
    if (transpilationCache.has(codeString)) {
      console.log('[Worker] Cache hit! Sending cached transpiled code.');
      self.postMessage({
        type: 'TRANSFORM_SUCCESS',
        payload: { transformedCode: transpilationCache.get(codeString) }
      });
      return;
    }

    // Ensure Babel is loaded before proceeding
    const isBabelReady = await ensureBabelLoaded();
    if (!isBabelReady) {
      console.error('[Worker] Babel is not available. Cannot transform code.');
      // Error message already sent by ensureBabelLoaded if load failed
      return;
    }

    try {
      // Transpile JSX and modern JS
      console.log('[Worker] Transforming code (cache miss) using only react preset...');
      let transformedCode = self.Babel.transform(codeString, {
        presets: ['react'],
      }).code;
      console.log('[Worker] Transformation finished.');

      if (!transformedCode) {
        throw new Error('Babel transformation resulted in empty code.');
      }

      // --- WORKAROUND: Attempt to remove simple require calls --- 
      console.log('[Worker] Attempting to remove simple require() calls...');
      const codeWithoutRequire = transformedCode.replace(/require\s*\(\s*['"][^'"]+['"]\s*\)/g, 'undefined');
      if (transformedCode !== codeWithoutRequire) {
          console.warn('[Worker] Replaced require() calls. This might lead to runtime errors if the required module was essential.');
      }
      // --- End Workaround ---

      // --- WORKAROUND 2: Replace React import for Blob/module context ---
      console.log('[Worker] Attempting to replace React import with global assignment...');
      const codeForModule = codeWithoutRequire.replace(/import\s+React(?:,\s*\{([^}]+)\})?\s+from\s+['"]react['"];?/g, (match, namedImports) => {
          let replacement = 'const React = window.React;';
          if (namedImports) {
              const imports = namedImports.split(',').map(s => s.trim()).filter(Boolean);
              replacement += '\n' + imports.map(imp => `const ${imp} = window.React.${imp};`).join('\n');
          }
          console.log('[Worker] Replaced React import statement.');
          return replacement;
      });
      // --- End Workaround 2 ---

      // Store processed code (with require removed AND import replaced) in cache
      transpilationCache.set(codeString, codeForModule);
      console.log('[Worker] Stored result in cache. Cache size:', transpilationCache.size);

      console.log('[Worker] Sending TRANSFORM_SUCCESS back to main thread.');
      self.postMessage({
        type: 'TRANSFORM_SUCCESS',
        payload: { transformedCode: codeForModule } // Send the final processed code
      });

    } catch (error) {
      console.error('[Worker] Error transforming code:', error);
      console.log('[Worker] Sending TRANSFORM_ERROR back to main thread.');
      self.postMessage({
        type: 'TRANSFORM_ERROR',
        payload: { error: error.message || 'Unknown transformation error' }
      });
    }
  } else {
    console.warn('[Worker] Received unknown message type:', type);
  }
};

console.log('[Worker] Artifact worker initialized and ready for messages (CDN Babel, lazy load, cache enabled).'); 