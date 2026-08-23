import { StudentFeatureVector } from './types.js';
import { FEATURE_KEYS, FeatureKey, FEATURE_LABELS } from './logisticRegression.js';

interface TreeNode {
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number; // Leaf prediction probability
}

class DecisionTree {
  maxDepth: number;
  minSamplesSplit: number;
  root: TreeNode | null = null;

  constructor(maxDepth = 5, minSamplesSplit = 4) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  private calculateGini(y: number[]): number {
    if (y.length === 0) return 0;
    const p1 = y.filter(val => val === 1).length / y.length;
    const p0 = 1 - p1;
    return 1 - (p1 * p1 + p0 * p0);
  }

  private buildTree(X: number[][], y: number[], depth = 0): TreeNode {
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;
    const numPositives = y.filter(val => val === 1).length;
    const prob = numSamples > 0 ? numPositives / numSamples : 0;

    if (depth >= this.maxDepth || numSamples < this.minSamplesSplit || prob === 0 || prob === 1) {
      return { value: prob };
    }

    let bestGiniGain = -1;
    let bestFeatureIdx = -1;
    let bestThreshold = 0;

    // Sample a random subset of features (sqrt(N))
    const featureSubsetSize = Math.max(1, Math.floor(Math.sqrt(numFeatures)));
    const featureIndices: number[] = [];
    while (featureIndices.length < featureSubsetSize) {
      const randIdx = Math.floor(Math.random() * numFeatures);
      if (!featureIndices.includes(randIdx)) featureIndices.push(randIdx);
    }

    const currentGini = this.calculateGini(y);

    for (const featIdx of featureIndices) {
      const featureVals = X.map(row => row[featIdx]);
      const thresholds = Array.from(new Set(featureVals)).sort((a, b) => a - b);

      for (let i = 0; i < thresholds.length - 1; i++) {
        const threshold = (thresholds[i] + thresholds[i + 1]) / 2;

        const leftY: number[] = [];
        const rightY: number[] = [];

        for (let s = 0; s < numSamples; s++) {
          if (X[s][featIdx] <= threshold) leftY.push(y[s]);
          else rightY.push(y[s]);
        }

        if (leftY.length === 0 || rightY.length === 0) continue;

        const leftGini = this.calculateGini(leftY);
        const rightGini = this.calculateGini(rightY);
        const weightedGini = (leftY.length / numSamples) * leftGini + (rightY.length / numSamples) * rightGini;
        const giniGain = currentGini - weightedGini;

        if (giniGain > bestGiniGain) {
          bestGiniGain = giniGain;
          bestFeatureIdx = featIdx;
          bestThreshold = threshold;
        }
      }
    }

    if (bestGiniGain <= 0 || bestFeatureIdx === -1) {
      return { value: prob };
    }

    const leftX: number[][] = [], leftY: number[] = [];
    const rightX: number[][] = [], rightY: number[] = [];

    for (let s = 0; s < numSamples; s++) {
      if (X[s][bestFeatureIdx] <= bestThreshold) {
        leftX.push(X[s]);
        leftY.push(y[s]);
      } else {
        rightX.push(X[s]);
        rightY.push(y[s]);
      }
    }

    return {
      featureIdx: bestFeatureIdx,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1)
    };
  }

  fit(X: number[][], y: number[]) {
    this.root = this.buildTree(X, y, 0);
  }

  predictTree(node: TreeNode, x: number[]): number {
    if (node.value !== undefined) return node.value;
    if (node.featureIdx !== undefined && node.threshold !== undefined) {
      if (x[node.featureIdx] <= node.threshold) {
        return this.predictTree(node.left!, x);
      } else {
        return this.predictTree(node.right!, x);
      }
    }
    return 0.5;
  }
}

export class RandomForestModel {
  trees: DecisionTree[] = [];
  numTrees: number;
  featureImportances: Record<string, number> = {};

  constructor(numTrees = 20) {
    this.numTrees = numTrees;
  }

  fit(data: StudentFeatureVector[]) {
    const X = data.map(d => FEATURE_KEYS.map(k => Number(d[k])));
    const y = data.map(d => d.placement_status);
    const n = X.length;

    this.trees = [];

    // Bootstrap Aggregation (Bagging)
    for (let t = 0; t < this.numTrees; t++) {
      const bootX: number[][] = [];
      const bootY: number[] = [];

      for (let i = 0; i < n; i++) {
        const randIdx = Math.floor(Math.random() * n);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }

      const tree = new DecisionTree(5, 3);
      tree.fit(bootX, bootY);
      this.trees.push(tree);
    }

    // Compute empirical feature importance from tree split counts
    const splitCounts: number[] = new Array(FEATURE_KEYS.length).fill(0);

    const countSplits = (node: TreeNode | null) => {
      if (!node || node.value !== undefined) return;
      if (node.featureIdx !== undefined) splitCounts[node.featureIdx]++;
      countSplits(node.left ?? null);
      countSplits(node.right ?? null);
    };

    this.trees.forEach(t => countSplits(t.root));
    const totalSplits = splitCounts.reduce((a, b) => a + b, 0) || 1;

    FEATURE_KEYS.forEach((key, idx) => {
      this.featureImportances[FEATURE_LABELS[key]] = Number((splitCounts[idx] / totalSplits).toFixed(4));
    });
  }

  predictProbability(rawFeatures: Partial<Record<FeatureKey, number>>): number {
    const x = FEATURE_KEYS.map(k => Number(rawFeatures[k] ?? 0));
    if (this.trees.length === 0) return 0.5;

    const preds = this.trees.map(t => t.predictTree(t.root!, x));
    const avg = preds.reduce((a, b) => a + b, 0) / preds.length;
    return Number(avg.toFixed(4));
  }

  getFeatureImportance(): Record<string, number> {
    return this.featureImportances;
  }
}
