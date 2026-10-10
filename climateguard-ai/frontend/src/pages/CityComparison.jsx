import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import RiskScoreBadge from '../components/RiskScoreBadge';
import { LoadingSkeleton, ErrorMessage } from '../components/ErrorMessage';
import { Scale, Check, AlertCircle, ArrowRightLeft } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function CityComparison() {
  const { locations } = useLocation();
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default initial pair: Vijayawada & Hyderabad
  useEffect(() => {
    if (locations.length >= 2 && selectedIds.length === 0) {
      const v = locations.find((l) => l.name.toLowerCase().includes('vijayawada')) || locations[0];
      const h = locations.find((l) => l.name.toLowerCase().includes('hyderabad')) || locations[1];
      setSelectedIds([v.id, h.id]);
    }
  }, [locations]);

  const toggleLocation = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('You must keep at least 2 cities selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 5) {
        alert('Maximum 5 cities can be compared simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const fetchComparison = async () => {
    if (selectedIds.length < 2) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.compareLocations(selectedIds);
      setComparisonData(res);
    } catch (err) {
      setError(err.message || 'Failed to compare cities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length >= 2) {
      fetchComparison();
    }
  }, [selectedIds]);

  const compared = comparisonData?.locations || [];

  // Chart data formatting
  const riskScoresChart = compared.map((c) => ({
    name: c.name,
    Overall: c.overall_risk_score,
    Heat: c.heat_score,
    Rainfall: c.rainfall_score,
    DrySpell: c.dry_spell_score,
  }));

  const weatherStatsChart = compared.map((c) => ({
    name: c.name,
    Temperature: c.current_temperature,
    Humidity: c.relative_humidity,
    Precipitation: c.current_precipitation,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Multi-City Climate Risk Benchmarking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized comparative analysis across monitored Indian urban corridors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20">
          <ArrowRightLeft className="w-4 h-4" />
          <span>{selectedIds.length} Cities Selected</span>
        </div>
      </div>

      {/* City Checkbox Selector Bar */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Select Cities to Benchmark (Choose 2 to 5)
        </span>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => {
            const isSelected = selectedIds.includes(loc.id);
            return (
              <button
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                <span>{loc.name}</span>
                <span className="text-[10px] text-slate-400">({loc.state})</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton height="h-96" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchComparison} />
      ) : (
        <>
          {/* Side-by-Side Comparison Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(compared.length, 4)} gap-4`}>
            {compared.map((city) => (
              <div key={city.location_id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{city.name}</h3>
                    <span className="text-xs text-slate-400">{city.state}</span>
                  </div>
                  <RiskScoreBadge score={city.overall_risk_score} level={city.risk_level} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Temp</span>
                    <strong className="text-white font-mono text-sm">{city.current_temperature}°C</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Humidity</span>
                    <strong className="text-white font-mono text-sm">{city.relative_humidity}%</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Heat Score (40%):</span>
                    <strong className="text-amber-400 font-mono">{city.heat_score}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rainfall Score (35%):</span>
                    <strong className="text-sky-400 font-mono">{city.rainfall_score}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dry-Spell (25%):</span>
                    <strong className="text-orange-400 font-mono">{city.dry_spell_score}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Bar Chart: Risk Indices */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1">Comparative Risk Indicator Scores (0–100)</h3>
            <p className="text-xs text-slate-400 mb-4">Normalized score comparison across all selected cities</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskScoresChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Overall" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Overall Index" />
                  <Bar dataKey="Heat" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Heat Score" />
                  <Bar dataKey="Rainfall" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rainfall Score" />
                  <Bar dataKey="DrySpell" fill="#f97316" radius={[4, 4, 0, 0]} name="Dry-Spell Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
