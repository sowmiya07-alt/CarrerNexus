import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, RefreshCw, ArrowRight, Sparkles, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import { GaugeChart } from '../components/GaugeChart';

export const WhatIfSimulatorPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Baseline Features
  const [baseline, setBaseline] = useState({
    cgpa: 8.1,
    coding_score: 64,
    aptitude_score: 65,
    communication_score: 70,
    number_of_projects: 2,
    internship_status: 1,
    internship_count: 1,
    certifications_count: 2,
    resume_score: 72,
    interview_score: 68
  });

  // Hypothetical Features
  const [hypothetical, setHypothetical] = useState({ ...baseline });

  // Simulation Results State
  const [result, setResult] = useState<{
    currentReadinessScore: number;
    simulatedReadinessScore: number;
    readinessDelta: number;
    currentLikelihood: number;
    simulatedLikelihood: number;
    likelihoodDelta: number;
    modelUsed: string;
    disclaimer: string;
  } | null>(null);

  useEffect(() => {
    runSimulation();
  }, [hypothetical]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runWhatIfSimulation(baseline, hypothetical);
      setResult(res);
    } catch (err) {
      console.error('Failed to run what-if simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHypothetical({ ...baseline });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Sliders className="w-6 h-6 mr-2 text-brand-400" />
            What-If Career Simulator Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate hypothetical skill & academic improvements to forecast impact on placement readiness & ML likelihood
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reset Sliders to Baseline
        </button>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simulator Controls (7 Cols) */}
        <div className="lg:col-span-7 card-saas space-y-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
            <span>Hypothetical Parameter Sliders</span>
            <span className="text-[10px] text-brand-400 font-mono">Live Recalculation</span>
          </h3>

          <div className="space-y-4">
            
            {/* CGPA Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">CGPA</span>
                <span className="text-brand-400">{hypothetical.cgpa.toFixed(2)} / 10.0</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={hypothetical.cgpa}
                onChange={e => setHypothetical({ ...hypothetical, cgpa: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Coding Score Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Coding & DSA Score</span>
                <span className="text-brand-400">{hypothetical.coding_score} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={hypothetical.coding_score}
                onChange={e => setHypothetical({ ...hypothetical, coding_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Aptitude Score Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Aptitude & Reasoning Score</span>
                <span className="text-brand-400">{hypothetical.aptitude_score} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={hypothetical.aptitude_score}
                onChange={e => setHypothetical({ ...hypothetical, aptitude_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Communication Score Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Communication & Interview Score</span>
                <span className="text-brand-400">{hypothetical.communication_score} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="1"
                value={hypothetical.communication_score}
                onChange={e => setHypothetical({ ...hypothetical, communication_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Project Count Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Projects Count</span>
                <span className="text-brand-400">{hypothetical.number_of_projects} Projects</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={hypothetical.number_of_projects}
                onChange={e => setHypothetical({ ...hypothetical, number_of_projects: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Internship Toggle */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">Verified Internship Experience</span>
              <button
                type="button"
                onClick={() => setHypothetical({
                  ...hypothetical,
                  internship_status: hypothetical.internship_status === 1 ? 0 : 1,
                  internship_count: hypothetical.internship_status === 1 ? 0 : 1
                })}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  hypothetical.internship_status === 1
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hypothetical.internship_status === 1 ? 'Completed ✓' : 'None ✗'}
              </button>
            </div>

          </div>
        </div>

        {/* Results Visualizer (5 Cols) */}
        <div className="lg:col-span-5 card-saas space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center mb-1">
              <Sparkles className="w-4 h-4 mr-2 text-brand-400" />
              Simulated Forecast Results
            </h3>
            <p className="text-xs text-slate-400">Recalculated metrics comparing baseline vs simulated parameter state</p>
          </div>

          {result && (
            <div className="space-y-6">
              
              {/* Readiness Score Forecast */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase">Rule-Based Readiness</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    result.readinessDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {result.readinessDelta >= 0 ? `+${result.readinessDelta}` : result.readinessDelta} PTS
                  </span>
                </div>

                <div className="flex items-center justify-around pt-2">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Baseline</span>
                    <span className="text-xl font-bold text-slate-400">{result.currentReadinessScore}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center">
                    <span className="text-[10px] text-brand-400 uppercase block">Simulated</span>
                    <span className="text-2xl font-extrabold text-white">{result.simulatedReadinessScore}</span>
                  </div>
                </div>
              </div>

              {/* ML Placement Likelihood Forecast */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase">ML Placement Probability</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    result.likelihoodDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {result.likelihoodDelta >= 0 ? `+${(result.likelihoodDelta * 100).toFixed(1)}%` : `${(result.likelihoodDelta * 100).toFixed(1)}%`}
                  </span>
                </div>

                <div className="flex items-center justify-around pt-2">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Baseline</span>
                    <span className="text-xl font-bold text-slate-400">{(result.currentLikelihood * 100).toFixed(1)}%</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-400 uppercase block">Simulated</span>
                    <span className="text-2xl font-extrabold text-emerald-400">{(result.simulatedLikelihood * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 italic">
            "Simulation based on trained statistical model and not a guaranteed future outcome."
          </div>
        </div>

      </div>

    </div>
  );
};
