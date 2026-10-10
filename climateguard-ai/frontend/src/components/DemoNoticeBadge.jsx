import React from 'react';
import { Info } from 'lucide-react';

export default function DemoNoticeBadge({ isDemo, message }) {
  if (!isDemo) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
      <Info className="w-4 h-4 shrink-0 text-indigo-400" />
      <span>
        <strong>DEMO DATA:</strong> {message || 'Public meteorological API fallback active. Values are strictly for demonstration.'}
      </span>
    </div>
  );
}
