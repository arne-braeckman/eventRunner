'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class LeadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lead Management Error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-amber-500">
              <AlertTriangleIcon className="w-full h-full" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Lead Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We encountered an issue loading the lead management interface. 
              This might be due to a temporary data processing issue.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm font-medium text-red-800 mb-2">
                Error Details:
              </p>
              <p className="text-sm text-red-700 font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center gap-2"
                variant="default"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                If this error persists, please contact support with the error details above.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}