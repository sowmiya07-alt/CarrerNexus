import { getDb } from '../db/database.js';

export interface ScoringWeights {
  cgpa_weight: number;
  coding_weight: number;
  aptitude_weight: number;
  comm_weight: number;
  project_weight: number;
  internship_weight: number;
}

export async function getScoringWeights(): Promise<ScoringWeights> {
  const db = await getDb();
  const config = await db.get('SELECT * FROM scoring_config ORDER BY id DESC LIMIT 1');
  if (config) {
    return {
      cgpa_weight: config.cgpa_weight,
      coding_weight: config.coding_weight,
      aptitude_weight: config.aptitude_weight,
      comm_weight: config.comm_weight,
      project_weight: config.project_weight,
      internship_weight: config.internship_weight,
    };
  }
  return {
    cgpa_weight: 0.25,
    coding_weight: 0.25,
    aptitude_weight: 0.15,
    comm_weight: 0.15,
    project_weight: 0.10,
    internship_weight: 0.10,
  };
}

export async function updateScoringWeights(weights: ScoringWeights) {
  const db = await getDb();
  await db.run(`
    INSERT INTO scoring_config (cgpa_weight, coding_weight, aptitude_weight, comm_weight, project_weight, internship_weight)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [weights.cgpa_weight, weights.coding_weight, weights.aptitude_weight, weights.comm_weight, weights.project_weight, weights.internship_weight]);
}

export function calculateRuleBasedReadinessScore(
  student: {
    cgpa: number;
    coding_score: number;
    aptitude_score: number;
    communication_score: number;
    number_of_projects: number;
    internship_status: number;
  },
  weights: ScoringWeights
): number {
  const cgpaNormalized = (student.cgpa / 10) * 100;
  const projectNormalized = Math.min((student.number_of_projects / 4) * 100, 100);
  const internshipNormalized = student.internship_status ? 100 : 0;

  const score = (
    cgpaNormalized * weights.cgpa_weight +
    student.coding_score * weights.coding_weight +
    student.aptitude_score * weights.aptitude_weight +
    student.communication_score * weights.comm_weight +
    projectNormalized * weights.project_weight +
    internshipNormalized * weights.internship_weight
  );

  return Number(Math.min(Math.max(score, 0), 100).toFixed(1));
}
