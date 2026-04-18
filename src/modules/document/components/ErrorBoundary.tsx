"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Universal Error Boundary for document templates.
 * Prevents a single rendering error from crashing the entire browser session.
 */
export class DocumentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Document Rendering Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-12 border-2 border-dashed border-rose-200 bg-rose-50/20 rounded-3xl text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-rose-100 rounded-full text-rose-600">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Rendering Failed
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  There was an unexpected error while generating this document.
                </p>
              </div>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  if (this.props.onReset) this.props.onReset();
                }}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
