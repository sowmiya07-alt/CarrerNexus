import { StudentFeatureVector } from './types.js';
import { FEATURE_KEYS, FeatureKey, FEATURE_LABELS } from './logisticRegression.js';

interface RegressionNode {
  featureIdx?: number;
  threshold?: number;
  left?: RegressionNode;
  right?: RegressionNode;
  value?: number;
}

class RegressionTree {
  maxDepth: number;

  constructor(maxDepth = 3) {
    this.maxDepth = maxDepth;
  }

  private buildTree(X: number[][], residuals: number[], depth = 0): RegressionNode {
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;
    const meanResidual = numSamples > 0 ? residuals.reduce((a, b) => a + b, 0) / numSamples : 0;

    if (depth >= this.maxDepth || numSamples < 4) {
      return { value: meanResidual };
    }

    let bestVarianceReduction = -1;
    let bestFeatureIdx = -1;
    let bestThreshold = 0;

    const currentVariance = residuals.reduce((a, b) => a + Math.pow(b - meanResidual, 2), 0);

    for (let f = 0; f < numFeatures; f++) {
      const featureVals = X.map(row => row[f]);
      const thresholds = Array.from(new Set(featureVals)).sort((a, b) => a - b);

      for (let i = 0; i < thresholds.length - 1; i++) {
        const threshold = (thresholds[i] + thresholds[i + 1]) / 2;

        const leftRes: number[] = [];
        const rightRes: number[] = [];

        for (let s = 0; s < numSamples; s++) {
          if (X[s][f] <= threshold) leftRes.push(residuals[s]);
          else rightRes.push(residuals[s]);
        }

        if (leftRes.length === 0 || rightRes.length === 0) continue;

        const leftMean = leftRes.reduce((a, b) => a + b, 0) / leftRes.length;
        const rightMean = rightRes.reduce((a, b) => a + b, 0) / rightRes.length;

        const leftVar = leftRes.reduce((a, b) => a + Math.pow(b - leftMean, 2), 0);
        const rightVar = rightRes.reduce((a, b) => a + Math.pow(b - rightMean, 2), 0);

        const varReduction = currentVariance - (leftVar + rightVar);

        if (varReduction > bestVarianceReduction) {
          bestVarianceReduction = varReduction;
          bestFeatureIdx = f;
          bestThreshold = threshold;
        }
      }
    }

    if (bestVarianceReduction <= 0 || bestFeatureIdx === -1) {
      return { value: meanResidual };
    }

    const leftX: number[][] = [], leftRes: number[] = [];
    const rightX: number[][] = [], rightRes: number[] = [];

    for (let s = 0; s < numSamples; s++) {
      if (X[s][bestFeatureIdx] <= bestThreshold) {
        leftX.push(X[s]);
        leftRes.push(residuals[s]);
      } else {
        rightX.push(X[s]);
        rightRes.push(residuals[s]);
      }
    }

    return {
      featureIdx: bestFeatureIdx,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftRes, depth + 1),
      right: this.buildTree(rightX, rightRes, depth + 1)
    };
  }

  fit(X: number[][], residuals: number[]): RegressionNode {
    return this.buildTree(X, residuals, 0);
  }

  predict(node: RegressionNode, x: number[]): number {
    if (node.value !== undefined) return node.value;
    if (node.featureIdx !== undefined && node.threshold !== undefined) {
      if (x[node.featureIdx] <= node.threshold) return this.predict(node.left!, x);
      else return this.predict(node.right!, x);
    }
    return 0;
  }
}

export class GradientBoostingModel {
  baseF0: number = 0;
  trees: { tree: RegressionNode; learningRate: number }[] = [];
  numEstimators: number;
  learningRate: number;
  featureImportances: Record<string, number> = {};

  constructor(numEstimators = 15, learningRate = 0.1) {
    this.numEstimators = numEstimators;
    this.learningRate = learningRate;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  }

  private logOdds(p: number): number {
    const clampedP = Math.min(Math.max(p, 1e-4), 1 - 1e-4);
    return Math.log(clampedP / (1 - clampedP));
  }

  fit(data: StudentFeatureVector[]) {
    const X = data.map(d => FEATURE_KEYS.map(k => Number(d[k])));
    const y = data.map(d => d.placement_status);
    const n = X.length;

    const initialProb = y.reduce((a, b) => a + b, 0) / n;
    this.baseF0 = this.logOdds(initialProb);

    let rawPredictions = new Array(n).fill(this.baseF0);
    this.trees = [];

    const splitCounts: number[] = new Array(FEATURE_KEYS.length).fill(0);

    for (let m = 0; m < this.numEstimators; m++) {
      const probabilities = rawPredictions.map(f => this.sigmoid(f));
      const residuals = y.map((yi, idx) => yi - probabilities[idx]);

      const regTree = new RegressionTree(3);
      const rootNode = regTree.fit(X, residuals);

      // Track split counts for feature importance
      const countSplits = (node: RegressionNode | null) => {
        if (!node || node.value !== undefined) return;
        if (node.featureIdx !== undefined) splitCounts[node.featureIdx]++;
        countSplits(node.left ?? null);
        countSplits(node.right ?? null);
      };
      countSplits(rootNode);

      this.trees.push({ tree: rootNode, learningRate: this.learningRate });

      for (let i = 0; i < n; i++) {
        const update = regTree.predict(rootNode, X[i]);
        rawPredictions[i] += this.learningRate * update;
      }
    }

    const totalSplits = splitCounts.reduce((a, b) => a + b, 0) || 1;
    FEATURE_KEYS.forEach((key, idx) => {
      this.featureImportances[FEATURE_LABELS[key]] = Number((splitCounts[idx] / totalSplits).toFixed(4));
    });
  }

  predictProbability(rawFeatures: Partial<Record<FeatureKey, number>>): number {
    const x = FEATURE_KEYS.map(k => Number(rawFeatures[k] ?? 0));
    let rawF = this.baseF0;

    for (const { tree, learningRate } of this.trees) {
      const regTree = new RegressionTree();
      rawF += learningRate * regTree.predict(tree, x);
    }

    return Number(this.sigmoid(rawF).toFixed(4));
  }

  getFeatureImportance(): Record<string, number> {
    return this.featureImportances;
  }
}
