export interface StudentFeatureVector {
  id: number;
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
  placement_status: number; // Target y: 0 or 1
}

export interface ModelEvaluationMetrics {
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

export interface ShapExplanation {
  baseValue: number;
  predictedProbability: number;
  positiveFactors: Array<{ feature: string; label: string; impact: number; value: number }>;
  improvementAreas: Array<{ feature: string; label: string; impact: number; value: number }>;
}

export interface WhatIfSimulationResult {
  currentLikelihood: number;
  simulatedLikelihood: number;
  likelihoodDelta: number;
  currentReadinessScore: number;
  simulatedReadinessScore: number;
  readinessDelta: number;
  positiveDrivers: string[];
  recommendedFocusAreas: string[];
}
