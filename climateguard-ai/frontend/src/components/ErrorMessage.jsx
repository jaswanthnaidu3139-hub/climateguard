import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl glass-panel border border-rose-500/30">
      <div className="p-3 mb-3 rounded-full bg-rose-500/10 text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100">Intelligence Stream Interrupted</h3>
      <p className="max-w-md mt-1 text-sm text-slate-400">
        {message || 'Unable to retrieve meteorological or risk data at this moment.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white transition-colors rounded-lg bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ lines = 3, height = 'h-24' }) {
  return (
    <div className={`w-full rounded-xl glass-panel p-6 animate-pulse ${height}`}>
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-slate-800/60 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-800/40 rounded w-1/2"></div>
    </div>
  );
}
