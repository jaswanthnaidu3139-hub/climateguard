import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import RiskScoreBadge from '../components/RiskScoreBadge';
import IndicatorCard from '../components/IndicatorCard';
import DemoNoticeBadge from '../components/DemoNoticeBadge';
import { LoadingSkeleton, ErrorMessage } from '../components/ErrorMessage';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const { selectedLocation } = useLocation();
  const [weatherData, setWeatherData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      setError(null);
      const [weatherRes, riskRes] = await Promise.all([
        api.getWeather(selectedLocation.id),
        api.getRisk(selectedLocation.id),
      ]);
      setWeatherData(weatherRes);
      setRiskData(riskRes);
    } catch (err) {
      setError(err.message || 'Failed to retrieve climate intelligence for the selected city.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-44" />
        </div>
        <LoadingSkeleton height="h-64" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  const current = weatherData?.current || {};
  const overallScore = riskData?.overall_score ?? 0;
  const isHigh = overallScore >= 60;
  const isModerate = overallScore >= 30 && overallScore < 60;

  // Forecast graph data
  const chartData = (weatherData?.daily_forecast || []).map((day) => ({
    date: day.date ? day.date.slice(5) : '',
    maxTemp: day.temperature_max,
    minTemp: day.temperature_min,
    precip: day.precipitation_sum,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Location Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {selectedLocation?.name}
            </h1>
            <span className="text-sm font-medium px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {selectedLocation?.state}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Geographic Coordinates: {selectedLocation?.latitude}° N, {selectedLocation?.longitude}° E • Elev. {selectedLocation?.elevation || 15}m
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <RiskScoreBadge score={overallScore} level={riskData?.risk_level} size="lg" />
          <DemoNoticeBadge isDemo={weatherData?.is_demo || riskData?.is_demo} message={weatherData?.status_message} />
        </div>
      </div>

      {/* Primary KPI Grid: Current Weather & Composite Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Temp */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Temperature</span>
            <Thermometer className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {current.temperature?.toFixed(1) ?? '--'}
            </span>
            <span className="text-slate-400 font-medium">°C</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Feels like observation from {weatherData?.source || 'Open-Meteo'}
          </p>
        </div>

        {/* Humidity */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Relative Humidity</span>
            <Droplets className="w-5 h-5 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {current.relative_humidity?.toFixed(0) ?? '--'}
            </span>
            <span className="text-slate-400 font-medium">%</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Atmospheric moisture saturation
          </p>
        </div>

        {/* Precipitation */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Precipitation Rate</span>
            <CloudRain className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {current.precipitation?.toFixed(1) ?? '0.0'}
            </span>
            <span className="text-slate-400 font-medium">mm</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Observed 1-hour liquid accumulation
          </p>
        </div>

        {/* Wind Speed */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Surface Wind Speed</span>
            <Wind className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {current.wind_speed?.toFixed(1) ?? '0.0'}
            </span>
            <span className="text-slate-400 font-medium">km/h</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            10-meter wind velocity reading
          </p>
        </div>
      </div>

      {/* Main Climate Risk Score Breakdown Card */}
      <div className="p-6 rounded-2xl glass-panel border border-teal-500/20 bg-gradient-to-br from-[#121d36] to-[#0c1322]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Composite Climate Risk Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Methodology {riskData?.methodology_version || 'v1.0-mvp'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {selectedLocation?.name} Risk Assessment: {riskData?.risk_level}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Weighted index combining daily thermal peaks (40%), 24-hour rainfall runoff volumes (35%), and 14-day cumulative precipitation anomalies (25%).
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 self-start lg:self-center">
            <div className="text-center">
              <div className="text-4xl font-black font-mono tracking-tight text-white">
                {overallScore}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">
                Index / 100
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <div>
              <div className="text-xs font-medium text-slate-400">Status</div>
              <div className={`text-base font-bold ${isHigh ? 'text-rose-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'}`}>
                {riskData?.risk_level} Risk
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Core Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <IndicatorCard
            type="heat"
            title="Extreme Heat Indicator"
            detail={riskData?.indicator_details?.heat}
          />
          <IndicatorCard
            type="rainfall"
            title="Heavy Rainfall Indicator"
            detail={riskData?.indicator_details?.rainfall}
          />
          <IndicatorCard
            type="dry_spell"
            title="Dry-Spell Deficit Indicator"
            detail={riskData?.indicator_details?.dry_spell}
          />
        </div>
      </div>

      {/* Forecast Trend Preview & Priority Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">7-Day Meteorological Outlook</h3>
              <p className="text-xs text-slate-400">Daily maximum temperatures and expected precipitation</p>
            </div>
            <Link
              to="/climate-analysis"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              Full Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="maxTemp"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                  name="Max Temp (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Source: Open-Meteo Numerical Forecast</span>
            <span>Refreshed: Real-time</span>
          </div>
        </div>

        {/* Priority Action Planner Preview */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Recommended Actions</h3>
              <Link
                to="/action-planner"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(riskData?.recommendations || []).slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rec.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rec.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <h4 className="mt-2 text-xs font-semibold text-slate-200 line-clamp-1">{rec.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <Link
              to="/risk-analysis"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Launch What-If Scenario Simulator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
