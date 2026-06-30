import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-lg">
            We encountered an unexpected error while rendering this page. Please try refreshing.
          </p>
          <Button onClick={() => window.location.reload()} size="lg" className="gap-2">
            <RefreshCw className="w-5 h-5" /> Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}