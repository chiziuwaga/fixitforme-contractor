'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Client-side error caught:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error details for debugging iPhone issues
    if (typeof window !== 'undefined') {
      console.error('[ErrorBoundary] User Agent:', navigator.userAgent);
      console.error('[ErrorBoundary] localStorage available:', this.checkLocalStorageAvailable());
      console.error('[ErrorBoundary] Screen size:', window.innerWidth, 'x', window.innerHeight);
    }
  }

  private checkLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">
                {isIOS ? 'iPhone Compatibility Issue' : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {isIOS 
                  ? 'We detected an iPhone compatibility issue. Try the suggestions below:'
                  : 'A client-side error occurred. Please try refreshing the page.'
                }
              </p>
              
              {isIOS && (
                <div className="bg-muted p-3 rounded-md text-xs space-y-2">
                  <p><strong>iPhone Fix Suggestions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Disable Private Browsing mode</li>
                    <li>Clear Safari cache and cookies</li>
                    <li>Update to latest iOS version</li>
                    <li>Try Chrome or Firefox instead</li>
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">Error Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
