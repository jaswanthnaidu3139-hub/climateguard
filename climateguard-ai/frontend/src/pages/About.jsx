import React from 'react';
import { Shield, BookOpen, AlertTriangle, Database, Info, ExternalLink } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function About() {
  const { locations } = useLocation();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              About ClimateGuard AI & Scoring Methodology
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Community Climate Risk Intelligence Platform — Built for transparency, explainability, and action.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <h3 className="font-bold text-amber-300">Public Advisory & Decision Support Disclaimer</h3>
            <p>
              ClimateGuard AI is an educational screening and community climate decision-support platform. It is <strong>NOT</strong> an official emergency broadcast system and does not claim to produce scientifically validated disaster probabilities or life-safety flood forecasts.
            </p>
            <p className="text-xs text-amber-300/80">
              During extreme weather emergencies, always follow directives from the National Disaster Management Authority (NDMA), India Meteorological Department (IMD), and state emergency management agencies.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-400" />
          Scoring Engine Architecture (v1.0-mvp)
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <p>
            The ClimateGuard AI Risk Engine computes a normalized index between <strong>0.0</strong> (minimal stress) and <strong>100.0</strong> (severe climate hazard potential). The composite score is mathematically formulated as:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-teal-300">
            Overall Score = (0.40 × Heat Score) + (0.35 × Heavy-Rainfall Score) + (0.25 × Dry-Spell Score)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="font-bold text-amber-400 mb-2">1. Extreme Heat (40%)</h4>
              <p className="text-xs text-slate-400">
                Maps daily maximum temperature:
                <br />• &lt;32°C: Score 20
                <br />• 32°C to &lt;35°C: Score 40
                <br />• 35°C to 40°C: Score 70
                <br />• &gt;40°C: Score 90 to 100
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="font-bold text-sky-400 mb-2">2. Heavy Rainfall (35%)</h4>
              <p className="text-xs text-slate-400">
                Measures 24h precipitation rate:
                <br />• ≤1 mm: Score 15 (Dry/trace)
                <br />• 1–15 mm: Score 30 (Light/Mod)
                <br />• 15–35 mm: Score 55 (Substantial)
                <br />• 35–65 mm: Score 75 (Heavy runoff)
                <br />• &gt;65 mm: Score 90+ (Downpour)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="font-bold text-orange-400 mb-2">3. Dry-Spell Deficit (25%)</h4>
              <p className="text-xs text-slate-400">
                Evaluates 14-day rolling precipitation anomaly:
                <br />A = (Observed - Baseline) / max(Baseline, 1.0)
                <br />• A ≥ -15%: Score 20 (Normal)
                <br />• -40% to -15%: Score 40 (Mild)
                <br />• -70% to -40%: Score 65 (Significant)
                <br />• &lt; -70%: Score 88 (Severe)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Providers & Freshness */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-400" />
          Verified Public Data Ingestion
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white mb-1">Open-Meteo Weather Forecast API</h4>
            <p className="text-slate-400">
              Provides numerical weather prediction forecasts (temperature, relative humidity, wind velocity, and hourly precipitation) refreshed hourly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white mb-1">Open-Meteo Historical Archive</h4>
            <p className="text-slate-400">
              High-resolution historical reanalysis models spanning past days, months, and seasons for retrospective baseline benchmarking.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white mb-1">OpenStreetMap & Carto Tiles</h4>
            <p className="text-slate-400">
              Interactive vector geospatial tiles powering the multi-city Leaflet risk exploration map.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white mb-1">Supabase PostgreSQL Layer</h4>
            <p className="text-slate-400">
              Cloud relational storage schema with automated fallback to resilient in-memory local caching for guaranteed demo uptime.
            </p>
          </div>
        </div>
      </div>

      {/* Monitored Locations Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">
          Active Monitored Locations ({locations.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">City Name</th>
                <th className="p-3">State</th>
                <th className="p-3">Latitude</th>
                <th className="p-3">Longitude</th>
                <th className="p-3">Elevation</th>
                <th className="p-3">Timezone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{loc.name}</td>
                  <td className="p-3 text-slate-400">{loc.state}</td>
                  <td className="p-3 font-mono">{loc.latitude}° N</td>
                  <td className="p-3 font-mono">{loc.longitude}° E</td>
                  <td className="p-3 font-mono">{loc.elevation ?? '--'} m</td>
                  <td className="p-3">{loc.timezone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
