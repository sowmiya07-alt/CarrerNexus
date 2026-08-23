import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ModelEvaluation, ClusterSummary } from '../types';
import { Cpu, CheckCircle2, Award, PieChart, Layers, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const MLWorkbenchPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<string>('');
  const [evaluations, setEvaluations] = useState<ModelEvaluation[]>([]);
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');

  useEffect(() => {
    loadMlData();
  }, []);

  const loadMlData = async () => {
    setLoading(true);
    try {
      const mlRes = await api.getMlMetrics();
      setActiveModel(mlRes.activeModel);
      setEvaluations(mlRes.evaluations);
      setDisclaimer(mlRes.disclaimer);

      const clusterRes = await api.getClusters();
      setClusters(clusterRes.clusters);
    } catch (err) {
      console.error('Failed to load ML workbench metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400 font-medium">Evaluating ML model pipelines & confusion matrices...</p>
        </div>
      </div>
    );
  }

  const topModelEval = evaluations.find(e => e.modelName === activeModel) || evaluations[0];
  const featureImpArray = topModelEval ? Object.entries(topModelEval.featureImportance).map(([key, val]) => ({
    feature: key,
    importance: Number((val * 100).toFixed(1))
  })).sort((a, b) => b.importance - a.importance) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <Cpu className="w-6 h-6 mr-2 text-brand-400" />
              Machine Learning & Model Evaluation Workbench
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Model: {activeModel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Cross-validation benchmarks, model selection, confusion matrices, and K-Means student segmentation</p>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="card-saas space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center">
            <Award className="w-4 h-4 mr-2 text-brand-400" />
            Model Performance Comparison (80/20 Train-Test Validation)
          </h3>
          <p className="text-xs text-slate-400">Models evaluated across standard classification metrics on test partition</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">ROC-AUC</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evaluations.map((model, idx) => {
                const isActive = model.modelName === activeModel;
                return (
                  <tr key={idx} className={`hover:bg-slate-800/40 ${isActive ? 'bg-brand-500/5' : ''}`}>
                    <td className="p-3 font-semibold text-slate-100 flex items-center">
                      {model.modelName}
                      {isActive && <span className="ml-2 text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30">Selected</span>}
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-200">{(model.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono font-medium text-slate-200">{(model.precision * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono font-medium text-slate-200">{(model.recall * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono font-bold text-brand-400">{(model.f1Score * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono font-medium text-slate-200">{(model.rocAuc * 100).toFixed(1)}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isActive ? 'Optimal' : 'Evaluated'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrices Grid */}
      <div className="card-saas space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <PieChart className="w-4 h-4 mr-2 text-brand-400" />
          Confusion Matrices (Test Set Partitions)
        </h3>
        <p className="text-xs text-slate-400">Detailed True Positive, False Positive, True Negative, and False Negative counts</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {evaluations.map((ev, i) => (
            <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>{ev.modelName}</span>
                <span className="text-[10px] text-slate-500 font-mono">F1: {(ev.f1Score * 100).toFixed(1)}%</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                  <span className="text-[10px] text-emerald-400 block font-semibold">True Positive (TP)</span>
                  <span className="text-lg font-bold text-emerald-300">{ev.confusionMatrix.truePositive}</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                  <span className="text-[10px] text-rose-400 block font-semibold">False Positive (FP)</span>
                  <span className="text-lg font-bold text-rose-300">{ev.confusionMatrix.falsePositive}</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                  <span className="text-[10px] text-amber-400 block font-semibold">False Negative (FN)</span>
                  <span className="text-lg font-bold text-amber-300">{ev.confusionMatrix.falseNegative}</span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg">
                  <span className="text-[10px] text-blue-400 block font-semibold">True Negative (TN)</span>
                  <span className="text-lg font-bold text-blue-300">{ev.confusionMatrix.trueNegative}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="card-saas">
        <h3 className="text-sm font-bold text-slate-100 mb-1">Global Feature Importance Weights ({activeModel})</h3>
        <p className="text-xs text-slate-400 mb-4">Relative feature attribution weight across student feature vector</p>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureImpArray} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              <Bar dataKey="importance" name="Importance %" fill="#0c8de9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* K-Means Student Segmentation Clusters */}
      <div className="card-saas space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <Layers className="w-4 h-4 mr-2 text-brand-400" />
          K-Means Student Segmentation Clusters
        </h3>
        <p className="text-xs text-slate-400">Unsupervised student clustering into 6 actionable performance categories</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {clusters.map((c, i) => (
            <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100">{c.name}</h4>
                <span className="text-[10px] bg-slate-800 text-brand-400 px-2 py-0.5 rounded font-mono">
                  {c.count} Students
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{c.description}</p>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                <div>Avg CGPA: <span className="font-semibold text-white">{c.avgCgpa}</span></div>
                <div>Avg Coding: <span className="font-semibold text-white">{c.avgCoding}</span></div>
                <div>Avg Aptitude: <span className="font-semibold text-white">{c.avgAptitude}</span></div>
                <div>Placed Rate: <span className="font-semibold text-emerald-400">{c.placementRate}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
