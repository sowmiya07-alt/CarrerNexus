import { getDb } from '../db/database.js';

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

export async function getInterventionList(): Promise<InterventionPlan[]> {
  const db = await getDb();

  const highRiskStudents = await db.all(`
    SELECT * FROM students
    WHERE risk_level IN ('High', 'Critical') OR readiness_score < 65
    ORDER BY readiness_score ASC
  `);

  return highRiskStudents.map(student => {
    let primaryWeakness = 'Coding & Technical Skills';
    if (student.coding_score < 60) primaryWeakness = 'Coding & DSA Skills';
    else if (student.aptitude_score < 60) primaryWeakness = 'Numerical & Logical Aptitude';
    else if (student.communication_score < 60) primaryWeakness = 'Verbal & Communication Confidence';
    else if (student.number_of_projects < 2) primaryWeakness = 'Hands-on Technical Projects';

    const steps = [
      {
        step: 1,
        title: 'Diagnostic Benchmark & Foundations',
        description: `Complete foundational practice modules focusing on ${primaryWeakness}.`,
        duration: 'Week 1'
      },
      {
        step: 2,
        title: 'Weekly Proctored Assessment',
        description: 'Take timed technical & aptitude mock assessments to track improvement.',
        duration: 'Week 2'
      },
      {
        step: 3,
        title: 'Project & Portfolio Enhancement',
        description: 'Complete 2 full-stack/domain projects and upload to GitHub repository.',
        duration: 'Week 3'
      },
      {
        step: 4,
        title: 'Mock Technical & HR Interview',
        description: 'Participate in 1-on-1 placement readiness interview with placement mentor.',
        duration: 'Week 4'
      }
    ];

    return {
      studentId: student.id,
      studentCode: student.student_id,
      name: student.name,
      department: student.department,
      batch: student.batch,
      readinessScore: student.readiness_score,
      riskLevel: student.risk_level as 'High' | 'Critical',
      primaryWeakness,
      recommendedSteps: steps
    };
  });
}
