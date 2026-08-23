import { StudentFeatureVector } from './types.js';

export const FEATURE_KEYS = [
  'cgpa',
  'aptitude_score',
  'coding_score',
  'communication_score',
  'technical_score',
  'number_of_projects',
  'internship_status',
  'internship_count',
  'certifications_count',
  'resume_score',
  'interview_score'
] as const;

export type FeatureKey = typeof FEATURE_KEYS[number];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  cgpa: 'CGPA',
  aptitude_score: 'Aptitude Score',
  coding_score: 'Coding Score',
  communication_score: 'Communication Score',
  technical_score: 'Technical Score',
  number_of_projects: 'Projects Count',
  internship_status: 'Internship Completed',
  internship_count: 'Internships Count',
  certifications_count: 'Certifications',
  resume_score: 'Resume Score',
  interview_score: 'Interview Score'
};

export class LogisticRegressionModel {
  weights: number[] = [];
  bias: number = 0;
  means: number[] = [];
  stds: number[] = [];

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  }

  private normalize(features: number[]): number[] {
    return features.map((val, i) => {
      const std = this.stds[i] || 1;
      return (val - (this.means[i] || 0)) / std;
    });
  }

  fit(data: StudentFeatureVector[], learningRate: number = 0.05, iterations: number = 400) {
    const numFeatures = FEATURE_KEYS.length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    // Calculate means and stds for feature scaling
    this.means = new Array(numFeatures).fill(0);
    this.stds = new Array(numFeatures).fill(0);

    for (let j = 0; j < numFeatures; j++) {
      const key = FEATURE_KEYS[j];
      const vals = data.map(d => Number(d[key]));
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
      this.means[j] = mean;
      this.stds[j] = Math.sqrt(variance) || 1;
    }

    const X = data.map(d => this.normalize(FEATURE_KEYS.map(k => Number(d[k]))));
    const y = data.map(d => d.placement_status);
    const m = X.length;

    // Gradient descent loop
    for (let iter = 0; iter < iterations; iter++) {
      let dw = new Array(numFeatures).fill(0);
      let db = 0;

      for (let i = 0; i < m; i++) {
        let z = this.bias;
        for (let j = 0; j < numFeatures; j++) {
          z += X[i][j] * this.weights[j];
        }
        const yPred = this.sigmoid(z);
        const error = yPred - y[i];

        for (let j = 0; j < numFeatures; j++) {
          dw[j] += error * X[i][j];
        }
        db += error;
      }

      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (learningRate * dw[j]) / m;
      }
      this.bias -= (learningRate * db) / m;
    }
  }

  predictProbability(rawFeatures: Partial<Record<FeatureKey, number>>): number {
    const featureVals = FEATURE_KEYS.map(k => Number(rawFeatures[k] ?? 0));
    const normX = this.normalize(featureVals);
    let z = this.bias;
    for (let j = 0; j < normX.length; j++) {
      z += normX[j] * this.weights[j];
    }
    return Number(this.sigmoid(z).toFixed(4));
  }

  getFeatureImportance(): Record<string, number> {
    const imp: Record<string, number> = {};
    const totalAbs = this.weights.reduce((a, b) => a + Math.abs(b), 0) || 1;
    FEATURE_KEYS.forEach((key, idx) => {
      imp[FEATURE_LABELS[key]] = Number((Math.abs(this.weights[idx]) / totalAbs).toFixed(4));
    });
    return imp;
  }
}
