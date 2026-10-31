import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StudyPlan component boundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl border border-red-500/20 bg-red-950/20 text-red-200 my-4 flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <h3 className="text-lg font-semibold text-red-300">
              {this.props.fallbackTitle || 'Component Render Failure'}
            </h3>
          </div>
          <p className="text-sm text-red-300/80 font-mono bg-red-950/40 p-3 rounded border border-red-500/10 w-full overflow-x-auto">
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg text-xs font-medium text-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Component State
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}