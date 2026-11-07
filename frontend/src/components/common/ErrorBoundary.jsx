import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Production diagnostic logging without exposing sensitive data
    console.error('[TeamFlow Application ErrorBoundary caught exception]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.handleReset,
        });
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-warm-50 text-left">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-warm-200 shadow-warm-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-terracotta-50 border border-terracotta-200 flex items-center justify-center text-terracotta-600 shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-terracotta-600">
                  Application Notice
                </span>
                <h2 className="text-xl font-heading font-extrabold text-warm-900 tracking-tight">
                  Something went wrong in this view
                </h2>
              </div>
            </div>

            <p className="text-sm text-warm-600 leading-relaxed">
              We encountered an unexpected display issue while rendering this section. Your workspace data and account session are intact.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-heading font-bold text-xs shadow-warm-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-warm-100 hover:bg-warm-200 text-warm-800 font-heading font-bold text-xs transition-colors border border-warm-200"
              >
                <span>Reload Page</span>
              </button>

              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-warm-500 hover:text-warm-800 transition-colors ml-auto"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
            </div>

            {/* Collapsible Error Diagnostics */}
            <div className="pt-2 border-t border-warm-100">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center justify-between w-full text-xs font-medium text-warm-400 hover:text-warm-600 py-1 transition-colors"
              >
                <span>Diagnostic details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-warm-900 text-warm-100 rounded-xl font-mono text-[11px] overflow-x-auto space-y-2">
                  <div className="text-terracotta-300 font-bold">
                    {this.state.error?.toString()}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-warm-400 whitespace-pre-wrap text-[10px] max-h-40 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
