import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, Student, InterventionPlan } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { ExportButton } from '../components/ExportButton';
import {
  Users, CheckCircle2, DollarSign, TrendingUp, AlertOctagon, Filter, Search, Sliders, Shield, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [interventions, setInterventions] = useState<InterventionPlan[]>([]);

  // Filter States
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Scoring Weight Customizer State
  const [weights, setWeights] = useState({
    cgpa_weight: 0.25,
    coding_weight: 0.25,
    aptitude_weight: 0.15,
    comm_weight: 0.15,
    project_weight: 0.10,
    internship_weight: 0.10
  });
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [savingWeights, setSavingWeights] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedBatch, selectedDepartment]);

  useEffect(() => {
    loadStudentRoster();
  }, [selectedBatch, selectedDepartment, selectedStatus, searchQuery]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics({
        batch: selectedBatch,
        department: selectedDepartment
      });
      setAnalytics(data);

      const intervRes = await api.getInterventions();
      setInterventions(intervRes.interventions);

      const weightRes = await api.getScoringWeights();
      setWeights(weightRes.weights);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentRoster = async () => {
    try {
      const res = await api.getStudents({
        batch: selectedBatch,
        department: selectedDepartment,
        status: selectedStatus,
        search: searchQuery
      });
      setStudents(res.students);
    } catch (err) {
      console.error('Failed to load student roster:', err);
    }
  };

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWeights(true);
    try {
      await api.updateScoringWeights(weights);
      setShowWeightModal(false);
      loadDashboardData();
      loadStudentRoster();
    } catch (err) {
      alert('Failed to save scoring configuration.');
    } finally {
      setSavingWeights(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400 font-medium">Aggregating college placement intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Admin Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Shield className="w-6 h-6 mr-2 text-brand-400" />
            Placement Officer Intelligence Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time placement analytics, department benchmarks, and student intervention tracking</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowWeightModal(!showWeightModal)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-4 h-4 mr-1.5 text-brand-400" />
            Scoring Methodology
          </button>
          <ExportButton />
        </div>
      </div>

      {/* Scoring Weights Customizer Modal */}
      {showWeightModal && (
        <div className="bg-slate-900 border border-brand-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-brand-400" />
              Configure Rule-Based Scoring Weights
            </h3>
            <span className="text-xs text-slate-400">Sum of weights should equal 1.0 (100%)</span>
          </div>

          <form onSubmit={handleSaveWeights} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CGPA Weight</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.cgpa_weight}
                onChange={e => setWeights({ ...weights, cgpa_weight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coding Weight</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.coding_weight}
                onChange={e => setWeights({ ...weights, coding_weight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Aptitude Weight</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.aptitude_weight}
                onChange={e => setWeights({ ...weights, aptitude_weight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Comm. Weight</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.comm_weight}
                onChange={e => setWeights({ ...weights, comm_weight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Weight</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.project_weight}
                onChange={e => setWeights({ ...weights, project_weight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Internship Wt.</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.internship_weight}
                onChange={e => setWeights({ ...weights, internship_weight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-100"
              />
            </div>

            <div className="col-span-full flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingWeights}
                className="px-4 py-1.5 rounded bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow"
              >
                {savingWeights ? 'Updating...' : 'Save Scoring Model'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filters:
          </span>

          {/* Batch Filter */}
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Batches</option>
            <option value="2023">Batch 2023</option>
            <option value="2024">Batch 2024</option>
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Civil Engineering">Civil</option>
          </select>

          {/* Placement Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Placed">Placed Only</option>
            <option value="Unplaced">Unplaced Only</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student name or roll ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* KPI Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Students" value={analytics.totalStudents} icon={<Users className="w-4 h-4" />} />
          <StatCard title="Placed Students" value={analytics.placedStudents} subtitle={`${analytics.overallPlacementPercentage}% Rate`} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} />
          <StatCard title="Average Package" value={`${analytics.avgPackageLpa} LPA`} icon={<DollarSign className="w-4 h-4 text-brand-400" />} />
          <StatCard title="Median Package" value={`${analytics.medianPackageLpa} LPA`} icon={<TrendingUp className="w-4 h-4 text-brand-400" />} />
          <StatCard title="Highest Package" value={`${analytics.highestPackageLpa} LPA`} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
          <StatCard title="High Risk Students" value={interventions.length} subtitle="Requires intervention" icon={<AlertOctagon className="w-4 h-4 text-rose-400" />} />
        </div>
      )}

      {/* Placement Trend Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Department Placement Comparison */}
          <div className="card-saas">
            <h3 className="text-sm font-bold text-slate-100 mb-1">Department-wise Placement Percentage</h3>
            <p className="text-xs text-slate-400 mb-4">Placement success rate across engineering departments</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={val => val.split(' ')[0]} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Bar dataKey="placementRate" name="Placement %" fill="#0c8de9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salary Package Band Distribution */}
          <div className="card-saas">
            <h3 className="text-sm font-bold text-slate-100 mb-1">Package Distribution Bands (LPA)</h3>
            <p className="text-xs text-slate-400 mb-4">Number of students selected in each salary band</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.packageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Student Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* High-Intervention Risk Table */}
      <div className="card-saas space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <AlertOctagon className="w-4 h-4 mr-2 text-rose-400" />
              Priority Intervention Roster
            </h3>
            <p className="text-xs text-slate-400">Students flagged by ML risk engine needing structured preparation roadmap</p>
          </div>
          <span className="text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 font-semibold">
            {interventions.length} Students At Risk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Roll ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Readiness</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Primary Weakness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {interventions.slice(0, 5).map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-semibold text-slate-200">{item.studentCode}</td>
                  <td className="p-3 font-medium text-slate-100">{item.name}</td>
                  <td className="p-3 text-slate-400">{item.department}</td>
                  <td className="p-3 text-slate-400">{item.batch}</td>
                  <td className="p-3 font-bold text-amber-400">{item.readinessScore} / 100</td>
                  <td className="p-3"><RiskBadge level={item.riskLevel} /></td>
                  <td className="p-3 text-slate-300 font-medium">{item.primaryWeakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="card-saas space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">Student Directory ({students.length})</h3>
          <span className="text-xs text-slate-500">Showing top matching student records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Roll ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Batch</th>
                <th className="p-3">CGPA</th>
                <th className="p-3">Coding</th>
                <th className="p-3">Aptitude</th>
                <th className="p-3">Readiness</th>
                <th className="p-3">Status</th>
                <th className="p-3">Placed Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.slice(0, 15).map((s, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-300">{s.student_id}</td>
                  <td className="p-3 font-semibold text-slate-100">{s.name}</td>
                  <td className="p-3 text-slate-400">{s.department.split(' ')[0]}</td>
                  <td className="p-3 text-slate-400">{s.batch}</td>
                  <td className="p-3 font-medium text-slate-200">{s.cgpa}</td>
                  <td className="p-3 text-slate-300">{s.coding_score}</td>
                  <td className="p-3 text-slate-300">{s.aptitude_score}</td>
                  <td className="p-3 font-bold text-brand-400">{s.readiness_score}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      s.placement_status === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {s.placement_status === 1 ? 'Placed' : 'Unplaced'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{s.placed_company || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
