import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || this.state.error?.toString() || 'Unknown rendering error';

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-lg">
            We encountered an unexpected error while rendering this page.
          </p>

          {/* Error Message Box */}
          <div className="mb-8 max-w-xl w-full p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-left">
            <p className="text-xs font-mono font-bold text-destructive break-words">
              {errorMessage}
            </p>
            {this.state.errorInfo?.componentStack && (
              <details className="mt-2 text-[10px] text-muted-foreground font-mono">
                <summary className="cursor-pointer text-xs font-semibold text-foreground hover:underline mb-1">
                  View Component Stack
                </summary>
                <pre className="p-2 bg-background/80 rounded border border-border overflow-x-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => window.location.reload()} size="lg" className="gap-2 rounded-xl shadow-md">
              <RefreshCw className="w-5 h-5" /> Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'} 
              size="lg" 
              className="gap-2 rounded-xl"
            >
              <Home className="w-5 h-5" /> Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}