import React from 'react';
import { Cpu, RefreshCw, Layers } from 'lucide-react';

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative bg-white p-4 rounded-3xl shadow-xl shadow-indigo-100 ring-1 ring-slate-100/50">
                    <RefreshCw className="animate-spin text-indigo-600" size={32} />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-slate-800 font-bold text-lg tracking-tight">Processing Data</h3>
                <p className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">{message}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
