import {
  User,
  Student,
  AnalyticsSummary,
  ModelEvaluation,
  ClusterSummary,
  SkillGapResult,
  CompanyMatch,
  InterventionPlan,
  ShapExplanation
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('careernexus_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('careernexus_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('careernexus_token');
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => apiFetch<{ user: User }>('/auth/me'),

  // Students
  getStudents: (params?: { batch?: string; department?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.batch) query.append('batch', params.batch);
    if (params?.department) query.append('department', params.department);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return apiFetch<{ students: Student[] }>(`/students?${query.toString()}`);
  },

  getStudentById: (id: number) =>
    apiFetch<{
      student: Student;
      skills: Array<{ name: string; category: string; proficiency: number }>;
      explanation: ShapExplanation;
      modelUsed: string;
    }>(`/students/${id}`),

  // Analytics
  getAnalytics: (params?: { batch?: string; department?: string; targetRole?: string }) => {
    const query = new URLSearchParams();
    if (params?.batch) query.append('batch', params.batch);
    if (params?.department) query.append('department', params.department);
    if (params?.targetRole) query.append('targetRole', params.targetRole);
    return apiFetch<AnalyticsSummary>(`/analytics?${query.toString()}`);
  },

  // ML Workbench
  getMlMetrics: () =>
    apiFetch<{ activeModel: string; evaluations: ModelEvaluation[]; disclaimer: string }>('/ml/metrics'),

  getClusters: () => apiFetch<{ clusters: ClusterSummary[] }>('/ml/clusters'),

  // What-If Simulator
  runWhatIfSimulation: (current: any, hypothetical: any) =>
    apiFetch<{
      currentReadinessScore: number;
      simulatedReadinessScore: number;
      readinessDelta: number;
      currentLikelihood: number;
      simulatedLikelihood: number;
      likelihoodDelta: number;
      modelUsed: string;
      disclaimer: string;
    }>('/ml/what-if', {
      method: 'POST',
      body: JSON.stringify({ current, hypothetical }),
    }),

  // Skill Gap & Company Match
  getSkillGap: (studentId: number, targetRole: string) =>
    apiFetch<SkillGapResult>(`/skill-gap?studentId=${studentId}&targetRole=${encodeURIComponent(targetRole)}`),

  getCompanyMatches: (studentId: number) =>
    apiFetch<{ matches: CompanyMatch[] }>(`/company-match?studentId=${studentId}`),

  // Interventions
  getInterventions: () => apiFetch<{ interventions: InterventionPlan[] }>('/interventions'),

  // Scoring Weights
  getScoringWeights: () => apiFetch<{ weights: any }>('/scoring/weights'),
  updateScoringWeights: (weights: any) =>
    apiFetch<{ message: string }>('/scoring/weights', {
      method: 'POST',
      body: JSON.stringify(weights),
    }),
};
