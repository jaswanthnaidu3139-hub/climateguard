import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskScoreBadge({ score, level, size = 'md' }) {
  const isHigh = score >= 60 || level === 'High';
  const isModerate = (score >= 30 && score < 60) || level === 'Moderate';

  let bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let Icon = ShieldCheck;
  let text = level || 'Low Risk';

  if (isHigh) {
    bgClass = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
    Icon = ShieldAlert;
    text = level || 'High Risk';
  } else if (isModerate) {
    bgClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    Icon = AlertTriangle;
    text = level || 'Moderate Risk';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{text}</span>
      {score !== undefined && score !== null && (
        <span className="font-mono font-bold opacity-90">({score})</span>
      )}
    </span>
  );
}
