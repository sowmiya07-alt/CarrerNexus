import { getDb } from '../db/database.js';

export interface SkillGapAnalysisResult {
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

const ROLE_REQUIRED_SKILLS: Record<string, string[]> = {
  'Software Engineer': ['Java', 'Data Structures & Algorithms', 'SQL & Database Design', 'Git & Version Control', 'Problem Solving'],
  'Full Stack Developer': ['JavaScript / TypeScript', 'React.js', 'Node.js / Express', 'SQL & Database Design', 'RESTful API Design'],
  'Data Analyst': ['Python', 'SQL & Database Design', 'Problem Solving', 'Communication & Verbal'],
  'DevOps Engineer': ['Docker & Kubernetes', 'AWS / Cloud Computing', 'Git & Version Control', 'Python'],
  'Cloud Architect': ['AWS / Cloud Computing', 'Docker & Kubernetes', 'RESTful API Design', 'Problem Solving'],
  'Embedded Systems Engineer': ['Verilog / Embedded C', 'Data Structures & Algorithms', 'Problem Solving'],
  'QA Automation Engineer': ['Python', 'Java', 'RESTful API Design', 'Problem Solving'],
  'UI/UX Designer': ['React.js', 'Communication & Verbal', 'Team Collaboration'],
  'Cybersecurity Analyst': ['Python', 'SQL & Database Design', 'AWS / Cloud Computing']
};

export async function analyzeSkillGap(studentId: number, targetRole: string): Promise<SkillGapAnalysisResult> {
  const db = await getDb();

  const studentSkills = await db.all<{ name: string; proficiency: number }[]>(`
    SELECT sk.name, ss.proficiency
    FROM student_skills ss
    JOIN skills sk ON ss.skill_id = sk.id
    WHERE ss.student_id = ?
  `, [studentId]);

  const studentSkillMap: Record<string, number> = {};
  studentSkills.forEach(s => {
    studentSkillMap[s.name] = s.proficiency;
  });

  const requiredSkills = ROLE_REQUIRED_SKILLS[targetRole] || ['Java', 'SQL & Database Design', 'Problem Solving'];

  const strongSkills: string[] = [];
  const skillsToImprove: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach(skill => {
    const prof = studentSkillMap[skill];
    if (prof !== undefined) {
      if (prof >= 4) strongSkills.push(skill);
      else skillsToImprove.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalReq = requiredSkills.length || 1;
  const matchPercentage = Number((((strongSkills.length + skillsToImprove.length * 0.5) / totalReq) * 100).toFixed(1));

  const prioritizedLearningRoadmap: SkillGapAnalysisResult['prioritizedLearningRoadmap'] = [];

  missingSkills.forEach(skill => {
    prioritizedLearningRoadmap.push({
      skill,
      action: `Complete foundational module and practical project in ${skill}.`,
      priority: 'High',
      estimatedHours: 40
    });
  });

  skillsToImprove.forEach(skill => {
    prioritizedLearningRoadmap.push({
      skill,
      action: `Practice advanced problem sets and mock interview questions for ${skill}.`,
      priority: 'Medium',
      estimatedHours: 25
    });
  });

  return {
    targetRole,
    strongSkills,
    skillsToImprove,
    missingSkills,
    matchPercentage,
    prioritizedLearningRoadmap
  };
}
