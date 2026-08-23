import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, RefreshCw, ArrowRight, Sparkles, Zap, Award, BookOpen, Layers } from 'lucide-react';
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

  const handlePreset = (preset: 'tier1' | 'coding' | 'academics') => {
    if (preset === 'tier1') {
      setHypothetical({
        ...baseline,
        coding_score: 88,
        aptitude_score: 85,
        communication_score: 82,
        number_of_projects: 4,
        internship_status: 1,
        internship_count: 2
      });
    } else if (preset === 'coding') {
      setHypothetical({
        ...baseline,
        coding_score: 92,
        number_of_projects: 4
      });
    } else if (preset === 'academics') {
      setHypothetical({
        ...baseline,
        cgpa: 9.4,
        aptitude_score: 88
      });
    }
  };

  const handleReset = () => {
    setHypothetical({ ...baseline });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Title Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <Sliders className="w-6 h-6 mr-2.5 text-sky-400" />
              What-If Career Simulator Lab
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
              Interactive ML Lab
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate hypothetical skill & academic parameter changes to forecast placement readiness and ML likelihood impact
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset Sliders
          </button>
        </div>
      </div>

      {/* Preset Target Scenario Quick Buttons */}
      <div className="glass-card p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Preset Target Scenarios</span>
          <span className="text-[10px] text-slate-500">One-click simulation target presets</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handlePreset('tier1')}
            className="flex items-center p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-xl text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mr-3 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">Target Tier-1 Tech Company</span>
              <span className="text-[10px] text-slate-400 block">Coding 88, Aptitude 85, 4 Projects</span>
            </div>
          </button>

          <button
            onClick={() => handlePreset('coding')}
            className="flex items-center p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mr-3 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">Technical & DSA Surge</span>
              <span className="text-[10px] text-slate-400 block">Coding 92, 4 Full-Stack Projects</span>
            </div>
          </button>

          <button
            onClick={() => handlePreset('academics')}
            className="flex items-center p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mr-3 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">Academic Excellence Boost</span>
              <span className="text-[10px] text-slate-400 block">CGPA 9.4, Aptitude 88</span>
            </div>
          </button>
        </div>
      </div>

      {/* Simulator Controls & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-sky-400" />
              Hypothetical Parameter Adjustments
            </h3>
            <span className="text-[10px] text-sky-400 font-mono font-semibold">Live Real-time Model Calculation</span>
          </div>

          <div className="space-y-4">
            
            {/* CGPA Slider */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">CGPA (Academic Performance)</span>
                <span className="text-sky-400 font-mono text-sm">{hypothetical.cgpa.toFixed(2)} / 10.0</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={hypothetical.cgpa}
                onChange={e => setHypothetical({ ...hypothetical, cgpa: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Coding Score Slider */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Coding & DSA Assessment Score</span>
                <span className="text-sky-400 font-mono text-sm">{hypothetical.coding_score} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={hypothetical.coding_score}
                onChange={e => setHypothetical({ ...hypothetical, coding_score: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Aptitude Score Slider */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Numerical & Logical Aptitude Score</span>
                <span className="text-sky-400 font-mono text-sm">{hypothetical.aptitude_score} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={hypothetical.aptitude_score}
                onChange={e => setHypothetical({ ...hypothetical, aptitude_score: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Communication Score Slider */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Communication & Interview Score</span>
                <span className="text-sky-400 font-mono text-sm">{hypothetical.communication_score} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="1"
                value={hypothetical.communication_score}
                onChange={e => setHypothetical({ ...hypothetical, communication_score: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Project Count Slider */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Completed Technical Projects</span>
                <span className="text-sky-400 font-mono text-sm">{hypothetical.number_of_projects} Projects</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={hypothetical.number_of_projects}
                onChange={e => setHypothetical({ ...hypothetical, number_of_projects: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Internship Toggle */}
            <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-200 block">Verified Internship Experience</span>
                <span className="text-[10px] text-slate-400">Industry project experience</span>
              </div>
              <button
                type="button"
                onClick={() => setHypothetical({
                  ...hypothetical,
                  internship_status: hypothetical.internship_status === 1 ? 0 : 1,
                  internship_count: hypothetical.internship_status === 1 ? 0 : 1
                })}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  hypothetical.internship_status === 1
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {hypothetical.internship_status === 1 ? 'Completed ✓' : 'None ✗'}
              </button>
            </div>

          </div>
        </div>

        {/* Results Forecast (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center mb-1">
              <Sparkles className="w-4 h-4 mr-2 text-sky-400" />
              Simulated Forecast Visualizer
            </h3>
            <p className="text-xs text-slate-400">Recalculated metrics comparing baseline state vs simulated state</p>
          </div>

          {result && (
            <div className="space-y-5">
              
              {/* Readiness Score Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Readiness Score</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                    result.readinessDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {result.readinessDelta >= 0 ? `+${result.readinessDelta}` : result.readinessDelta} PTS
                  </span>
                </div>

                <div className="flex items-center justify-around py-2">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Baseline</span>
                    <span className="text-xl font-bold text-slate-400 font-mono">{result.currentReadinessScore}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center">
                    <span className="text-[10px] text-sky-400 uppercase block font-medium">Simulated</span>
                    <span className="text-3xl font-extrabold text-white font-mono drop-shadow">{result.simulatedReadinessScore}</span>
                  </div>
                </div>
              </div>

              {/* ML Placement Likelihood Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">ML Placement Probability</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                    result.likelihoodDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {result.likelihoodDelta >= 0 ? `+${(result.likelihoodDelta * 100).toFixed(1)}%` : `${(result.likelihoodDelta * 100).toFixed(1)}%`}
                  </span>
                </div>

                <div className="flex items-center justify-around py-2">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Baseline</span>
                    <span className="text-xl font-bold text-slate-400 font-mono">{(result.currentLikelihood * 100).toFixed(1)}%</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-400 uppercase block font-medium">Simulated</span>
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono drop-shadow">{(result.simulatedLikelihood * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Transparent Disclaimer */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 italic">
            "Simulation based on trained statistical model and not a guaranteed future outcome."
          </div>
        </div>

      </div>

    </div>
  );
};
