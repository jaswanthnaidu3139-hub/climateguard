import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { LoadingSkeleton, ErrorMessage } from '../components/ErrorMessage';
import DemoNoticeBadge from '../components/DemoNoticeBadge';
import {
  Calendar,
  AlertCircle,
  TrendingUp,
  CloudRain,
  Thermometer,
  Info,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function ClimateAnalysis() {
  const { selectedLocation } = useLocation();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodDays, setPeriodDays] = useState(60); // 30, 60, 90, 180

  const fetchHistory = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      setError(null);

      // Compute dates
      const end = new Date();
      // Open-Meteo archive usually has a 2-5 day lag for fully verified reanalysis records
      end.setDate(end.getDate() - 3);
      const start = new Date(end);
      start.setDate(start.getDate() - periodDays);

      const endDateStr = end.toISOString().split('T')[0];
      const startDateStr = start.toISOString().split('T')[0];

      const res = await api.getClimateHistory(selectedLocation.id, startDateStr, endDateStr);
      setHistoryData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch historical meteorological observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedLocation?.id, periodDays]);

  const records = historyData?.records || [];
  const baseline = historyData?.baseline_summary || {};
  const anomalies = historyData?.anomaly_analysis?.anomalies || [];
  const monthlyTrends = historyData?.monthly_trends || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Historical Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Historical Climate & Trend Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Retrospective meteorological observations, baseline distributions, and standardized anomalies for {selectedLocation?.name}, {selectedLocation?.state}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1">
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  periodDays === days
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
          <DemoNoticeBadge isDemo={historyData?.is_demo} />
        </div>
      </div>

      {/* Baseline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Period Mean Temp</span>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {baseline.mean_temperature ?? '--'} °C
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Baseline arithmetic average</p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Cumulative Rainfall</span>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-400">
            {baseline.total_precipitation ?? '0.0'} mm
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{baseline.days_with_rain ?? 0} active rainfall days</p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Daily Mean Rain</span>
          <div className="mt-2 text-2xl font-bold font-mono text-teal-400">
            {baseline.avg_daily_precipitation ?? '0.0'} mm
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Daily average over {baseline.record_count ?? 0} days</p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Statistical Outliers</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {anomalies.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">|Z-score| ≥ 2.0σ temperature anomalies</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton height="h-72" />
          <LoadingSkeleton height="h-72" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchHistory} />
      ) : (
        <>
          {/* Daily Temperature Trends Chart */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Daily Temperature Trajectory (°C)</h3>
                <p className="text-xs text-slate-400">Observed Daily Maximum, Mean, and Minimum Temperatures</p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Range: {historyData?.start_date} to {historyData?.end_date}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="temperature_max" stroke="#ef4444" strokeWidth={2} dot={false} name="Max Temp (°C)" />
                  <Line type="monotone" dataKey="temperature_mean" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Mean Temp (°C)" />
                  <Line type="monotone" dataKey="temperature_min" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Min Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Precipitation Volume Chart */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Daily Precipitation Volume (mm)</h3>
                <p className="text-xs text-slate-400">Observed liquid precipitation totals per 24-hour cycle</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="precipitation" fill="#0ea5e9" name="Precipitation (mm)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistical Temperature Outliers / Anomalies */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Detected Temperature Anomalies (Z-Score ≥ 2.0σ)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Days where average temperatures deviated by two or more standard deviations from the {periodDays}-day window baseline mean ({baseline.mean_temperature}°C).
            </p>

            {anomalies.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                No extreme statistical outliers detected in this time interval. Temperatures remained within expected standard deviations.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {anomalies.map((anom, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">{anom.date}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          anom.direction === 'warm'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {anom.direction === 'warm' ? '+Warm Outlier' : '-Cold Outlier'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-white font-mono">
                      {anom.temperature}°C (Z = {anom.z_score > 0 ? `+${anom.z_score}` : anom.z_score}σ)
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{anom.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scientific Disclaimer Notice */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-200 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
            <div>
              <strong className="font-semibold">Distinction Between Weather & Climate Trends:</strong>
              <p className="mt-0.5 text-teal-300/90 leading-relaxed">
                Short-term anomalies shown here reflect seasonal weather variations and short-period oscillations. Validated long-term climatological changes require multidecadal (30-year) meteorological baseline standard reference periods.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
