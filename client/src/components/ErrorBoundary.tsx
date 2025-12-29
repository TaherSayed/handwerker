import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Hoppla!</h1>
                        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                            Ein unerwarteter Fehler ist aufgetreten. Keine Sorge, Ihre Daten sind sicher.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-8 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-32">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error?.toString()}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                NEU LADEN
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20"
                            >
                                <Home className="w-4 h-4" />
                                DASHBOARD
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.children;
    }
}

export default ErrorBoundary;
