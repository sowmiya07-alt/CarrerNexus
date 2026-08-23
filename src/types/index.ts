export interface User {
  id: number;
  email: string;
  role: 'Admin' | 'Student';
  studentDbId?: number;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  department: string;
  batch: string;
  cgpa: number;
  attendance_percentage: number;
  aptitude_score: number;
  coding_score: number;
  communication_score: number;
  technical_score: number;
  number_of_projects: number;
  internship_status: number;
  internship_count: number;
  certifications_count: number;
  resume_score: number;
  interview_score: number;
  placement_status: number;
  placed_company?: string;
  package_lpa?: number;
  target_role: string;
  readiness_score: number;
  ml_placement_likelihood: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  cluster_name?: string;
}

export interface ShapExplanation {
  baseValue: number;
  predictedProbability: number;
  positiveFactors: Array<{ feature: string; label: string; impact: number; value: number }>;
  improvementAreas: Array<{ feature: string; label: string; impact: number; value: number }>;
}

export interface ModelEvaluation {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  featureImportance: Record<string, number>;
}

export interface AnalyticsSummary {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  overallPlacementPercentage: number;
  avgCgpaPlaced: number;
  avgCgpaUnplaced: number;
  avgCodingScore: number;
  avgAptitudeScore: number;
  avgCommScore: number;
  avgPackageLpa: number;
  medianPackageLpa: number;
  highestPackageLpa: number;
  departmentStats: Array<{
    department: string;
    total: number;
    placed: number;
    placementRate: number;
    avgPackage: number;
  }>;
  batchTrends: Array<{
    batch: string;
    total: number;
    placed: number;
    placementRate: number;
    avgPackage: number;
  }>;
  packageDistribution: Array<{ range: string; count: number }>;
  skillDemandFrequency: Array<{ skill: string; frequency: number }>;
}

export interface SkillGapResult {
  targetRole: string;
  strongSkills: string[];
  skillsToImprove: string[];
  missingSkills: string[];
  matchPercentage: number;
  prioritizedLearningRoadmap: Array<{
    skill: string;
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedHours: number;
  }>;
}

export interface CompanyMatch {
  companyId: number;
  companyName: string;
  jobRole: string;
  matchScore: number;
  isEligible: boolean;
  packageRange: string;
  reasons: string[];
  missingCriteria: string[];
}

export interface InterventionPlan {
  studentId: number;
  studentCode: string;
  name: string;
  department: string;
  batch: string;
  readinessScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  primaryWeakness: string;
  recommendedSteps: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }>;
}

export interface ClusterSummary {
  clusterId: number;
  name: string;
  count: number;
  avgCgpa: number;
  avgCoding: number;
  avgAptitude: number;
  avgComm: number;
  placementRate: number;
  description: string;
}
