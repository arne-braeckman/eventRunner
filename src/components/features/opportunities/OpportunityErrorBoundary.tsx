"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class OpportunityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to console for debugging
    console.error('OpportunityErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-2xl mx-auto my-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Something went wrong</CardTitle>
                <p className="text-sm text-red-600 mt-1">
                  An error occurred while loading the opportunity pipeline
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Error Details:</h4>
              <p className="text-sm text-red-700 font-mono break-all">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Component Stack:</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-2">
              If this problem persists, please contact support with the error details above.
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useOpportunityErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Opportunity error:', error, errorInfo);
    
    // You could also send to error reporting service here
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }, []);

  return { handleError };
}