import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { LoadingSkeleton, ErrorMessage } from '../components/ErrorMessage';
import {
  CalendarCheck,
  Flame,
  CloudRain,
  SunMedium,
  CheckCircle2,
  Circle,
  Shield,
  Filter,
  BookOpen
} from 'lucide-react';

export default function ActionPlanner() {
  const { selectedLocation } = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [completedItems, setCompletedItems] = useState({});

  const fetchRecommendations = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecommendations(selectedLocation.id);
      setRecommendations(res);
    } catch (err) {
      setError(err.message || 'Failed to load climate action recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedLocation?.id]);

  const toggleComplete = (id) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filtered = recommendations.filter((r) => {
    if (filterCategory === 'all') return true;
    return r.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Community Climate Adaptation Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic resilience actions triggered by real-time risk scores for {selectedLocation?.name}, {selectedLocation?.state}.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterCategory === 'all'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Actions ({recommendations.length})
          </button>
          <button
            onClick={() => setFilterCategory('heat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterCategory === 'heat'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Heat
          </button>
          <button
            onClick={() => setFilterCategory('rainfall')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterCategory === 'rainfall'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Rainfall
          </button>
          <button
            onClick={() => setFilterCategory('dry_spell')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterCategory === 'dry_spell'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5" /> Dry-Spell
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-32" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchRecommendations} />
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl glass-panel border border-slate-800 text-slate-400 text-sm">
          No active recommendations found under the selected category.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => {
            const isDone = !!completedItems[rec.id];

            return (
              <div
                key={rec.id}
                className={`p-6 rounded-2xl glass-panel border transition-all ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(rec.id)}
                      className="mt-0.5 text-slate-400 hover:text-teal-400 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            rec.priority === 'High'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : rec.priority === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {rec.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          Trigger: {rec.triggering_indicator}
                        </span>
                      </div>

                      <h3 className={`text-base font-bold text-white mt-2 ${isDone ? 'line-through text-slate-400' : ''}`}>
                        {rec.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                        <div>
                          <strong className="text-slate-400">Trigger Condition:</strong> {rec.triggering_condition}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                          <span>{rec.supporting_source}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-start shrink-0">
                    <button
                      onClick={() => toggleComplete(rec.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        isDone
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {isDone ? 'Mark Incomplete' : 'Acknowledge Action'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
