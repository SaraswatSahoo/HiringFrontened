import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from './ui/Button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="flex items-center space-x-4 mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-slate-400">An unexpected error occurred</p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-300 mb-2">Error Details:</h2>
                <div className="bg-slate-900 rounded-lg p-4 border border-red-500/20">
                  <p className="text-red-400 text-sm font-mono">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="text-slate-400 text-sm cursor-pointer hover:text-white">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-slate-500 mt-2 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Button onClick={this.handleReset}>Go to Dashboard</Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
