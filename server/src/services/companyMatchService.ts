import { getDb } from '../db/database.js';

export interface CompanyMatch {
  companyId: number;
  companyName: string;
  jobRole: string;
  matchScore: number; // 0 to 100
  isEligible: boolean;
  packageRange: string;
  reasons: string[];
  missingCriteria: string[];
}

export async function matchCompaniesForStudent(studentId: number): Promise<CompanyMatch[]> {
  const db = await getDb();

  const student = await db.get(`
    SELECT * FROM students WHERE id = ?
  `, [studentId]);

  if (!student) return [];

  const companies = await db.all(`
    SELECT * FROM companies
  `);

  const results: CompanyMatch[] = [];

  for (const comp of companies) {
    let score = 100;
    const reasons: string[] = [];
    const missingCriteria: string[] = [];

    // CGPA Check
    if (student.cgpa < comp.minimum_cgpa) {
      score -= 30;
      missingCriteria.push(`CGPA ${student.cgpa} below cutoff of ${comp.minimum_cgpa}`);
    } else {
      reasons.push(`Meets CGPA cutoff (${student.cgpa} >= ${comp.minimum_cgpa})`);
    }

    // Coding Check
    if (student.coding_score < comp.coding_requirement) {
      const diff = comp.coding_requirement - student.coding_score;
      score -= Math.min(diff * 0.8, 20);
      missingCriteria.push(`Coding score ${student.coding_score} below requirement ${comp.coding_requirement}`);
    } else {
      reasons.push(`Strong coding profile (${student.coding_score}/100)`);
    }

    // Aptitude Check
    if (student.aptitude_score < comp.aptitude_requirement) {
      const diff = comp.aptitude_requirement - student.aptitude_score;
      score -= Math.min(diff * 0.6, 15);
      missingCriteria.push(`Aptitude score ${student.aptitude_score} below requirement ${comp.aptitude_requirement}`);
    }

    // Communication Check
    if (student.communication_score < comp.communication_requirement) {
      score -= 10;
      missingCriteria.push(`Communication score ${student.communication_score} below requirement ${comp.communication_requirement}`);
    }

    // Internship Preference Check
    if (comp.internship_preference === 1 && student.internship_status === 0) {
      score -= 10;
      missingCriteria.push(`Company prefers internship experience`);
    } else if (student.internship_status === 1) {
      reasons.push(`Internship experience verified`);
    }

    const finalMatchScore = Number(Math.max(score, 30).toFixed(1));
    const isEligible = student.cgpa >= comp.minimum_cgpa;

    results.push({
      companyId: comp.id,
      companyName: comp.company_name,
      jobRole: comp.job_role,
      matchScore: finalMatchScore,
      isEligible,
      packageRange: `${comp.package_min} - ${comp.package_max} LPA`,
      reasons,
      missingCriteria
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}
