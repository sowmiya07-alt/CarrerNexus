import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, SkillGapResult, CompanyMatch, ShapExplanation } from '../types';
import { GaugeChart } from '../components/GaugeChart';
import { RiskBadge } from '../components/RiskBadge';
import { Sparkles, CheckCircle, AlertTriangle, XCircle, Target, Briefcase, ChevronRight, Sliders, BookOpen, Layers, Award } from 'lucide-react';

interface StudentDashboardProps {
  studentDbId?: number;
  onOpenWhatIf: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentDbId = 1, onOpenWhatIf }) => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [skills, setSkills] = useState<Array<{ name: string; category: string; proficiency: number }>>([]);
  const [explanation, setExplanation] = useState<ShapExplanation | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('Random Forest');

  // Target Role & Skill Gap state
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);

  // Company Match state
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([]);

  useEffect(() => {
    loadStudentData();
  }, [studentDbId]);

  useEffect(() => {
    if (studentDbId && targetRole) {
      api.getSkillGap(studentDbId, targetRole)
        .then(res => setSkillGap(res))
        .catch(console.error);
    }
  }, [studentDbId, targetRole]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentById(studentDbId);
      setStudent(res.student);
      setSkills(res.skills);
      setExplanation(res.explanation);
      setModelUsed(res.modelUsed);
      setTargetRole(res.student.target_role || 'Software Engineer');

      const matchesRes = await api.getCompanyMatches(studentDbId);
      setCompanyMatches(matchesRes.matches);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400 font-medium">Loading placement profile analytics...</p>
        </div>
      </div>
    );
  }

  const mlPercentage = Number((student.ml_placement_likelihood * 100).toFixed(1));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {student.name}</h1>
            <RiskBadge level={student.risk_level} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {student.department} &bull; Batch of {student.batch} &bull; Roll ID: <span className="text-slate-200 font-mono">{student.student_id}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenWhatIf}
            className="inline-flex items-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors"
          >
            <Sliders className="w-4 h-4 mr-2" />
            Launch What-If Simulator
          </button>
        </div>
      </div>

      {/* Primary Analytics Section: Readiness Score vs ML Placement Likelihood */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rule-Based Readiness Gauge */}
        <div className="card-saas flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Placement Readiness Score</h3>
          <p className="text-[11px] text-slate-500 mb-2">Rule-Based Weighted Composite Metric</p>
          <GaugeChart score={student.readiness_score} size={170} label="Readiness Index" sublabel="/ 100 PTS" />
          <div className="mt-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
            CGPA (25%), Coding (25%), Aptitude (15%), Comm (15%), Projects & Internships (20%)
          </div>
        </div>

        {/* ML Placement Likelihood Gauge */}
        <div className="card-saas flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px] font-semibold border border-brand-500/20">
            {modelUsed}
          </div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Estimated Placement Likelihood</h3>
          <p className="text-[11px] text-slate-500 mb-2">Machine Learning Statistical Prediction</p>
          <GaugeChart score={mlPercentage} size={170} label="ML Probability" sublabel="Prob. %" />
          <p className="mt-2 text-[11px] text-slate-400 italic">
            "Estimated placement likelihood based on historical training data."
          </p>
        </div>

        {/* Academic & Skill Quick Stats */}
        <div className="card-saas space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic & Assessment Profile</h3>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CGPA</span>
              <span className="text-base font-bold text-slate-100">{student.cgpa} / 10</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Coding Score</span>
              <span className="text-base font-bold text-slate-100">{student.coding_score} / 100</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Aptitude Score</span>
              <span className="text-base font-bold text-slate-100">{student.aptitude_score} / 100</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Communication</span>
              <span className="text-base font-bold text-slate-100">{student.communication_score} / 100</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-400" /> Projects: {student.number_of_projects}
            </span>
            <span className="text-slate-400 flex items-center">
              <Award className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Internships: {student.internship_count}
            </span>
          </div>
        </div>

      </div>

      {/* SHAP Explainable AI Section */}
      {explanation && (
        <div className="card-saas">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-brand-400" />
                Explainable AI & Feature Attribution
              </h3>
              <p className="text-xs text-slate-400">Key drivers influencing your estimated placement likelihood</p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Base Population Mean: {(explanation.baseValue * 100).toFixed(1)}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Positive Drivers */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Top Positive Factors
              </h4>
              <div className="space-y-2">
                {explanation.positiveFactors.length > 0 ? (
                  explanation.positiveFactors.map((f, i) => (
                    <div key={i} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-200">{f.label}</span>
                        <span className="text-[10px] text-slate-500 block">Current Value: {f.value}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{(f.impact * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No strong positive drivers detected.</p>
                )}
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Recommended Improvement Areas
              </h4>
              <div className="space-y-2">
                {explanation.improvementAreas.length > 0 ? (
                  explanation.improvementAreas.map((f, i) => (
                    <div key={i} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-200">{f.label}</span>
                        <span className="text-[10px] text-slate-500 block">Current Value: {f.value}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {(f.impact * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No critical improvement risk areas detected.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Skill Gap Analysis Section */}
      <div className="card-saas space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <Target className="w-4 h-4 mr-2 text-brand-400" />
              Target Role Skill-Gap Analysis
            </h3>
            <p className="text-xs text-slate-400">Evaluate competencies required for specific career paths</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Target Role:</span>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Cloud Architect">Cloud Architect</option>
              <option value="QA Automation Engineer">QA Automation Engineer</option>
            </select>
          </div>
        </div>

        {skillGap && (
          <div className="space-y-4">
            
            {/* Skill Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Strong Skills */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center mb-2">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Strong Verified Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.strongSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20 font-medium">
                      {sk} ✓
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills to Improve */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Skills to Improve
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.skillsToImprove.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20 font-medium">
                      {sk} ⚠
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center mb-2">
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.missingSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20 font-medium">
                      {sk} ✗
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Prioritized Learning Roadmap */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center mb-2">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-brand-400" /> Prioritized Learning Roadmap
              </h4>
              <div className="space-y-2">
                {skillGap.prioritizedLearningRoadmap.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-100">{item.skill}</span>
                        <p className="text-[11px] text-slate-400">{item.action}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Est. {item.estimatedHours} hrs
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Company Matching Section */}
      <div className="card-saas space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-brand-400" />
          Company Profile Compatibility Ranking
        </h3>
        <p className="text-xs text-slate-400">Algorithmic compatibility based on CGPA, aptitude, coding benchmarks, and skill overlap</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {companyMatches.slice(0, 6).map((match, i) => (
            <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{match.companyName}</h4>
                    <p className="text-[11px] text-slate-400">{match.jobRole}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    match.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    match.matchScore >= 65 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {match.matchScore}% Match
                  </span>
                </div>
                <p className="text-[10px] text-brand-400 font-medium mt-1">Package: {match.packageRange}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                {match.reasons.map((r, idx) => (
                  <p key={idx} className="text-emerald-400 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" /> {r}
                  </p>
                ))}
                {match.missingCriteria.map((m, idx) => (
                  <p key={idx} className="text-amber-400 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" /> {m}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
