import React from 'react';
import { Flame, CloudRain, SunMedium, HelpCircle } from 'lucide-react';

const icons = {
  heat: Flame,
  rainfall: CloudRain,
  dry_spell: SunMedium,
};

const colors = {
  heat: {
    accent: 'text-amber-400',
    bar: 'bg-amber-500',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
  },
  rainfall: {
    accent: 'text-sky-400',
    bar: 'bg-sky-500',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/10',
  },
  dry_spell: {
    accent: 'text-orange-400',
    bar: 'bg-orange-500',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/10',
  },
};

export default function IndicatorCard({ type, title, detail }) {
  if (!detail) return null;

  const Icon = icons[type] || Flame;
  const theme = colors[type] || colors.heat;
  const score = detail.score ?? 0;
  const weightPct = Math.round((detail.weight || 0) * 100);

  return (
    <div className={`p-5 rounded-xl glass-panel border ${theme.border} transition-all duration-200 hover:border-slate-600`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${theme.bg} ${theme.accent}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-300">{title}</h4>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-white font-mono">
                {score}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
              {detail.raw_value !== undefined && detail.raw_value !== null && (
                <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  {detail.raw_value} {detail.unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400">
            {weightPct}% Weight
          </span>
          <div className="text-xs text-teal-400 font-mono mt-0.5">
            +{detail.contribution} pts
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 mt-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            score >= 60 ? 'bg-rose-500' : score >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      <div className="mt-3 text-xs text-slate-300 line-clamp-2">
        {detail.explanation}
      </div>

      {detail.threshold_or_baseline && (
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span className="text-slate-400">Baseline/Rule:</span> {detail.threshold_or_baseline}
        </div>
      )}
    </div>
  );
}
