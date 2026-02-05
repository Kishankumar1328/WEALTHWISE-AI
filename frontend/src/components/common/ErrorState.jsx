import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = "Something went wrong", message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100/50">
                <AlertTriangle size={40} strokeWidth={1.5} />
            </div>
            <div className="max-w-md space-y-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{message || "We encountered an issue while retrieving your data. Please try again."}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs uppercase tracking-wider"
                >
                    <RefreshCw size={14} /> Retry Connection
                </button>
            )}
        </div>
    );
};

export default ErrorState;
