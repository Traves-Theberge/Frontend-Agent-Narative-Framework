import * as Babel from '@babel/standalone';
import React from 'react';

// Define the expected structure of the evaluated module
interface EvaluatedModule {
  // Using React.ComponentType defaults props to 'any'
  default: React.ComponentType;
}

/**
 * Takes a string containing React component code (including JSX),
 * transpiles it using Babel standalone, evaluates it in a controlled scope,
 * and returns the default exported component.
 *
 * WARNING: Evaluating code from strings is inherently risky.
 * This implementation attempts to minimize risks but is not foolproof.
 * Ensure code comes from trusted sources or implement further sandboxing.
 *
 * NOTE: This function is NOT used in the current worker-based implementation.
 */
// Using React.ComponentType defaults props to 'any'
export function getReactComponentFromCode(code: string): React.ComponentType {
  if (!Babel) {
    throw new Error('Babel Standalone not loaded.');
  }

  try {
    // 1. Transpile JSX and modern JS to ES5/ES6 (React friendly)
    const transformedCode = Babel.transform(code, {
      presets: ['react', 'env'],
      plugins: [],
    }).code;

    if (!transformedCode) {
      throw new Error('Babel transformation resulted in empty code.');
    }

    // 2. Evaluate the transpiled code
    // Fix: Rename 'module' to avoid conflict
    const exports: Partial<EvaluatedModule> = {};
    const artifactModule = { exports }; 
    const scope = { React, module: artifactModule, exports }; // Provide React and module/exports

    const factory = new Function(...Object.keys(scope), `'use strict';\n${transformedCode}`);
    factory(...Object.values(scope));

    // 3. Extract the default export
    // Use updated variable name
    const Component = artifactModule.exports.default;

    if (!Component || typeof Component !== 'function') {
      throw new Error('Transpiled code did not produce a valid default export React component.');
    }

    return Component;
  // Fix: Use unknown for catch block error type
  } catch (error: unknown) {
    console.error("Error processing component code:", error);
    // Type check error before accessing message
    throw new Error(`Failed to get component from code: ${error instanceof Error ? error.message : String(error)}`);
  }
} 