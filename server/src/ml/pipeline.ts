import { getDb } from '../db/database.js';
import { StudentFeatureVector, ModelEvaluationMetrics } from './types.js';
import { LogisticRegressionModel, FEATURE_KEYS, FeatureKey } from './logisticRegression.js';
import { RandomForestModel } from './randomForest.js';
import { GradientBoostingModel } from './gradientBoosting.js';
import { calculateShapExplanation } from './explainability.js';
import { StudentClusteringEngine, ClusterSummary } from './clustering.js';

export class MLPipelineManager {
  private lrModel = new LogisticRegressionModel();
  private rfModel = new RandomForestModel(25);
  private gbdtModel = new GradientBoostingModel(20, 0.1);
  private clusteringEngine = new StudentClusteringEngine();

  public activeModelName: string = 'Random Forest';
  public evaluations: ModelEvaluationMetrics[] = [];
  public clusterSummaries: ClusterSummary[] = [];
  public trainingDataset: StudentFeatureVector[] = [];

  private calculateMetrics(
    modelName: string,
    predictFn: (f: Partial<Record<FeatureKey, number>>) => number,
    testData: StudentFeatureVector[],
    featureImportance: Record<string, number>
  ): ModelEvaluationMetrics {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    const probabilitiesAndActual = testData.map(d => {
      const prob = predictFn(d as unknown as Partial<Record<FeatureKey, number>>);
      const actual = d.placement_status;
      const pred = prob >= 0.5 ? 1 : 0;

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;

      return { prob, actual };
    });

    const total = testData.length || 1;
    const accuracy = Number(((tp + tn) / total).toFixed(4));
    const precision = Number((tp / (tp + fp || 1)).toFixed(4));
    const recall = Number((tp / (tp + fn || 1)).toFixed(4));
    const f1Score = Number(((2 * precision * recall) / (precision + recall || 1)).toFixed(4));

    // Approximate ROC-AUC trapezoidal integration
    probabilitiesAndActual.sort((a, b) => b.prob - a.prob);
    let numPositives = testData.filter(d => d.placement_status === 1).length || 1;
    let numNegatives = total - numPositives || 1;
    let aucSum = 0;
    let currentTps = 0;

    for (const item of probabilitiesAndActual) {
      if (item.actual === 1) {
        currentTps++;
      } else {
        aucSum += currentTps;
      }
    }
    const rocAuc = Number((aucSum / (numPositives * numNegatives)).toFixed(4));

    return {
      modelName,
      accuracy,
      precision,
      recall,
      f1Score,
      rocAuc,
      confusionMatrix: {
        truePositive: tp,
        falsePositive: fp,
        trueNegative: tn,
        falseNegative: fn
      },
      featureImportance
    };
  }

  async trainAndEvaluateAll(): Promise<ModelEvaluationMetrics[]> {
    const db = await getDb();
    const students = await db.all<StudentFeatureVector[]>(`
      SELECT id, cgpa, attendance_percentage, aptitude_score, coding_score,
             communication_score, technical_score, number_of_projects, internship_status,
             internship_count, certifications_count, resume_score, interview_score, placement_status
      FROM students
    `);

    if (!students || students.length === 0) {
      console.warn('No students found for ML pipeline training.');
      return [];
    }

    this.trainingDataset = students;

    // Train-Test Split (80/20)
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const splitIndex = Math.floor(shuffled.length * 0.8);
    const trainData = shuffled.slice(0, splitIndex);
    const testData = shuffled.slice(splitIndex);

    // Train Logistic Regression
    this.lrModel.fit(trainData);
    const lrEval = this.calculateMetrics(
      'Logistic Regression',
      f => this.lrModel.predictProbability(f),
      testData,
      this.lrModel.getFeatureImportance()
    );

    // Train Random Forest
    this.rfModel.fit(trainData);
    const rfEval = this.calculateMetrics(
      'Random Forest',
      f => this.rfModel.predictProbability(f),
      testData,
      this.rfModel.getFeatureImportance()
    );

    // Train Gradient Boosting
    this.gbdtModel.fit(trainData);
    const gbdtEval = this.calculateMetrics(
      'Gradient Boosting (XGBoost Equivalent)',
      f => this.gbdtModel.predictProbability(f),
      testData,
      this.gbdtModel.getFeatureImportance()
    );

    this.evaluations = [lrEval, rfEval, gbdtEval];

    // Select model with highest F1-Score
    this.evaluations.sort((a, b) => b.f1Score - a.f1Score);
    this.activeModelName = this.evaluations[0].modelName;

    // Fit Student Clustering
    this.clusterSummaries = this.clusteringEngine.fit(students);

    console.log(`ML Pipeline trained successfully! Active model selected: ${this.activeModelName} (F1: ${this.evaluations[0].f1Score})`);
    return this.evaluations;
  }

  predictStudentLikelihood(features: Partial<Record<FeatureKey, number>>): {
    likelihood: number;
    modelUsed: string;
    explanation: ReturnType<typeof calculateShapExplanation>;
  } {
    const predictFn = (f: Partial<Record<FeatureKey, number>>) => {
      if (this.activeModelName.includes('Logistic')) return this.lrModel.predictProbability(f);
      if (this.activeModelName.includes('Gradient')) return this.gbdtModel.predictProbability(f);
      return this.rfModel.predictProbability(f);
    };

    const likelihood = predictFn(features);
    const explanation = calculateShapExplanation(features, predictFn, this.trainingDataset);

    return {
      likelihood,
      modelUsed: this.activeModelName,
      explanation
    };
  }
}

export const mlPipeline = new MLPipelineManager();
