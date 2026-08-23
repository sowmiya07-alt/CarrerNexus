import { StudentFeatureVector, ShapExplanation } from './types.js';
import { FEATURE_KEYS, FeatureKey, FEATURE_LABELS } from './logisticRegression.js';

export function calculateShapExplanation(
  rawFeatures: Partial<Record<FeatureKey, number>>,
  modelPredictFn: (f: Partial<Record<FeatureKey, number>>) => number,
  population: StudentFeatureVector[]
): ShapExplanation {
  const currentProb = modelPredictFn(rawFeatures);

  // Baseline probability over average population features
  const avgFeatures: Partial<Record<FeatureKey, number>> = {};
  FEATURE_KEYS.forEach(key => {
    const sum = population.reduce((acc, p) => acc + Number(p[key]), 0);
    avgFeatures[key] = sum / (population.length || 1);
  });

  const baseProb = modelPredictFn(avgFeatures);

  const positiveFactors: Array<{ feature: string; label: string; impact: number; value: number }> = [];
  const improvementAreas: Array<{ feature: string; label: string; impact: number; value: number }> = [];

  // Marginal contribution per feature (SHAP perturbation approximation)
  FEATURE_KEYS.forEach(key => {
    const val = Number(rawFeatures[key] ?? 0);
    const avgVal = Number(avgFeatures[key] ?? 0);

    // Perturb feature towards baseline
    const perturbedFeatures = { ...rawFeatures, [key]: avgVal };
    const perturbedProb = modelPredictFn(perturbedFeatures);
    
    // Impact = contribution of this feature away from baseline
    const impact = Number((currentProb - perturbedProb).toFixed(4));

    const item = {
      feature: key,
      label: FEATURE_LABELS[key],
      impact,
      value: val
    };

    if (impact > 0.01) {
      positiveFactors.push(item);
    } else if (impact < -0.01 || val < avgVal) {
      improvementAreas.push(item);
    }
  });

  // Sort by magnitude
  positiveFactors.sort((a, b) => b.impact - a.impact);
  improvementAreas.sort((a, b) => a.impact - b.impact);

  return {
    baseValue: Number(baseProb.toFixed(4)),
    predictedProbability: currentProb,
    positiveFactors: positiveFactors.slice(0, 5),
    improvementAreas: improvementAreas.slice(0, 5)
  };
}
