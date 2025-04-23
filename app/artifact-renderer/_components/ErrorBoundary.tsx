'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ArtifactErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="text-destructive bg-destructive/10 p-3 rounded border border-destructive">
            <p className="font-bold">Artifact Runtime Error:</p>
            <p className="text-xs">Something went wrong while rendering this component.</p>
            {this.state.error && (
                <pre className="text-xs whitespace-pre-wrap mt-2 opacity-70">
                    {this.state.error.message}
                </pre>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
} 