import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import RiskScoreBadge from '../components/RiskScoreBadge';
import { LoadingSkeleton, ErrorMessage } from '../components/ErrorMessage';
import {
  Sliders,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Percent,
  Thermometer,
  CloudRain,
  SunMedium
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function RiskAnalysis() {
  const { selectedLocation } = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // What-If simulation inputs
  const [tempInput, setTempInput] = useState(38);
  const [rainInput, setRainInput] = useState(15);
  const [deficitInput, setDeficitInput] = useState(-30);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchAssessment = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRisk(selectedLocation.id);
      setAssessment(res);

      // Preload current values into sliders
      const rawTemp = res.indicator_details?.heat?.raw_value;
      if (rawTemp) setTempInput(Math.round(rawTemp));
    } catch (err) {
      setError(err.message || 'Failed to fetch risk assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [selectedLocation?.id]);

  const handleSimulate = async () => {
    if (!selectedLocation) return;
    try {
      setSimulating(true);
      const res = await api.simulateWhatIf({
        location_id: selectedLocation.id,
        hypothetical_temp_max: Number(tempInput),
        hypothetical_daily_rainfall: Number(rainInput),
        hypothetical_rolling_rainfall_deficit_pct: Number(deficitInput),
      });
      setSimulationResult(res);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setSimulationResult(null);
    if (assessment?.indicator_details?.heat?.raw_value) {
      setTempInput(Math.round(assessment.indicator_details.heat.raw_value));
    }
    setRainInput(15);
    setDeficitInput(-30);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height="h-40" />
        <LoadingSkeleton height="h-80" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAssessment} />;
  }

  const breakdownData = [
    {
      name: 'Heat Indicator',
      weight: '40%',
      score: assessment?.heat_score ?? 0,
      contribution: assessment?.indicator_details?.heat?.contribution ?? 0,
      color: '#f59e0b',
    },
    {
      name: 'Heavy Rainfall',
      weight: '35%',
      score: assessment?.rainfall_score ?? 0,
      contribution: assessment?.indicator_details?.rainfall?.contribution ?? 0,
      color: '#0ea5e9',
    },
    {
      name: 'Dry-Spell Deficit',
      weight: '25%',
      score: assessment?.dry_spell_score ?? 0,
      contribution: assessment?.indicator_details?.dry_spell?.contribution ?? 0,
      color: '#f97316',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Transparent Risk Scoring & What-If Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mathematical audit of compound indicators and interactive climate stress testing for {selectedLocation?.name}.
          </p>
        </div>

        <RiskScoreBadge score={assessment?.overall_score} level={assessment?.risk_level} size="lg" />
      </div>

      {/* Transparent Score Breakdown & Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Score Contribution Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Mathematical Weight Contribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How individual sub-indices contribute to the composite 0–100 overall score
            </p>
          </div>

          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" tick={{ fontSize: 12 }} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val, name, item) => [`${val} pts (Weight: ${item.payload.weight})`, 'Contribution']}
                />
                <Bar dataKey="contribution" radius={[0, 6, 6, 0]}>
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <strong>Composite Formula:</strong> (0.40 × {assessment?.heat_score}) + (0.35 × {assessment?.rainfall_score}) + (0.25 × {assessment?.dry_spell_score}) = <span className="text-teal-400 font-bold">{assessment?.overall_score} / 100</span>
          </div>
        </div>

        {/* Right: Methodology Factors & Limitations */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Contributing Factors & Scientific Caveats</h3>
          
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Thermal Sub-score Factor:</span>
              <p className="text-slate-300 mt-1">{assessment?.contributing_factors?.heat}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px]">Precipitation Runoff Factor:</span>
              <p className="text-slate-300 mt-1">{assessment?.contributing_factors?.rainfall}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-orange-400 uppercase tracking-wider text-[10px]">Dry-Spell Rolling Factor:</span>
              <p className="text-slate-300 mt-1">{assessment?.contributing_factors?.dry_spell}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Uncertainty & Limitations:</strong>
            <p className="mt-1">{assessment?.limitations_and_uncertainty}</p>
          </div>
        </div>
      </div>

      {/* Interactive What-If Scenario Simulator Section */}
      <div className="p-6 rounded-2xl glass-panel border border-teal-500/30 bg-gradient-to-br from-[#0e182e] to-[#0a1020]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-teal-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Interactive What-If Scenario Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Test resilience by simulating extreme weather perturbations without modifying stored records.
            </p>
          </div>
          <button
            onClick={handleResetSimulation}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Slider 1: Temperature */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Thermometer className="w-4 h-4" /> Hypothetical Max Temp
              </span>
              <span className="font-mono text-white text-sm">{tempInput}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="0.5"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              className="w-full mt-4 accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20°C (Mild)</span>
              <span>35°C (Threshold)</span>
              <span>50°C (Severe)</span>
            </div>
          </div>

          {/* Slider 2: 24h Rainfall */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-sky-400">
                <CloudRain className="w-4 h-4" /> Hypothetical 24h Rainfall
              </span>
              <span className="font-mono text-white text-sm">{rainInput} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="1"
              value={rainInput}
              onChange={(e) => setRainInput(e.target.value)}
              className="w-full mt-4 accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 mm</span>
              <span>35 mm (Heavy)</span>
              <span>150 mm (Deluge)</span>
            </div>
          </div>

          {/* Slider 3: Dry-Spell Deficit % */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-orange-400">
                <SunMedium className="w-4 h-4" /> Rolling Rainfall Deficit
              </span>
              <span className="font-mono text-white text-sm">{deficitInput}%</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={deficitInput}
              onChange={(e) => setDeficitInput(e.target.value)}
              className="w-full mt-4 accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>-100% (Extreme Deficit)</span>
              <span>0% (Normal)</span>
              <span>+100% (Surplus)</span>
            </div>
          </div>
        </div>

        {/* Execute Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sliders className="w-4 h-4" />
            {simulating ? 'Calculating Physics Engine...' : 'Run Scenario Simulation'}
          </button>
        </div>

        {/* Simulation Output Banner */}
        {simulationResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-900 border border-teal-500/40 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20">
                  Hypothetical Stress Test Result
                </span>
                <h4 className="text-lg font-bold text-white mt-1">
                  Scenario Score: {simulationResult.scenario_overall_score} / 100
                  <span className={`ml-3 text-sm font-bold ${simulationResult.score_delta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ({simulationResult.score_delta > 0 ? `+${simulationResult.score_delta}` : simulationResult.score_delta} pts vs baseline)
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">{simulationResult.explanation}</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 px-4 py-3 rounded-lg border border-slate-800 self-start md:self-center">
                <div>
                  <div className="text-[10px] text-slate-400">Baseline Level</div>
                  <div className="text-xs font-bold text-slate-200">{simulationResult.original_risk_level}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Simulated Level</div>
                  <div className="text-xs font-bold text-teal-300">{simulationResult.scenario_risk_level}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {simulationResult.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
