import { getDb } from '../db/database.js';

export interface AnalyticsSummary {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  overallPlacementPercentage: number;
  avgCgpaPlaced: number;
  avgCgpaUnplaced: number;
  avgCodingScore: number;
  avgAptitudeScore: number;
  avgCommScore: number;
  avgPackageLpa: number;
  medianPackageLpa: number;
  highestPackageLpa: number;
  departmentStats: Array<{
    department: string;
    total: number;
    placed: number;
    placementRate: number;
    avgPackage: number;
  }>;
  batchTrends: Array<{
    batch: string;
    total: number;
    placed: number;
    placementRate: number;
    avgPackage: number;
  }>;
  packageDistribution: Array<{
    range: string;
    count: number;
  }>;
  skillDemandFrequency: Array<{
    skill: string;
    frequency: number;
  }>;
}

export async function getPlacementAnalytics(filters?: {
  batch?: string;
  department?: string;
  targetRole?: string;
}): Promise<AnalyticsSummary> {
  const db = await getDb();

  let query = 'SELECT * FROM students WHERE 1=1';
  const params: any[] = [];

  if (filters?.batch && filters.batch !== 'All') {
    query += ' AND batch = ?';
    params.push(filters.batch);
  }
  if (filters?.department && filters.department !== 'All') {
    query += ' AND department = ?';
    params.push(filters.department);
  }
  if (filters?.targetRole && filters.targetRole !== 'All') {
    query += ' AND target_role = ?';
    params.push(filters.targetRole);
  }

  const students = await db.all(query, params);
  const totalStudents = students.length;

  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      placedStudents: 0,
      unplacedStudents: 0,
      overallPlacementPercentage: 0,
      avgCgpaPlaced: 0,
      avgCgpaUnplaced: 0,
      avgCodingScore: 0,
      avgAptitudeScore: 0,
      avgCommScore: 0,
      avgPackageLpa: 0,
      medianPackageLpa: 0,
      highestPackageLpa: 0,
      departmentStats: [],
      batchTrends: [],
      packageDistribution: [],
      skillDemandFrequency: []
    };
  }

  const placedStudentsList = students.filter(s => s.placement_status === 1);
  const unplacedStudentsList = students.filter(s => s.placement_status === 0);

  const placedStudents = placedStudentsList.length;
  const unplacedStudents = unplacedStudentsList.length;
  const overallPlacementPercentage = Number(((placedStudents / totalStudents) * 100).toFixed(1));

  const avgCgpaPlaced = placedStudents > 0
    ? Number((placedStudentsList.reduce((a, b) => a + b.cgpa, 0) / placedStudents).toFixed(2))
    : 0;

  const avgCgpaUnplaced = unplacedStudents > 0
    ? Number((unplacedStudentsList.reduce((a, b) => a + b.cgpa, 0) / unplacedStudents).toFixed(2))
    : 0;

  const avgCodingScore = Number((students.reduce((a, b) => a + b.coding_score, 0) / totalStudents).toFixed(1));
  const avgAptitudeScore = Number((students.reduce((a, b) => a + b.aptitude_score, 0) / totalStudents).toFixed(1));
  const avgCommScore = Number((students.reduce((a, b) => a + b.communication_score, 0) / totalStudents).toFixed(1));

  // Package statistics
  const packages = placedStudentsList.map(s => s.package_lpa).filter(Boolean).sort((a, b) => a - b);
  const avgPackageLpa = packages.length > 0
    ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2))
    : 0;

  let medianPackageLpa = 0;
  if (packages.length > 0) {
    const mid = Math.floor(packages.length / 2);
    medianPackageLpa = packages.length % 2 !== 0 ? packages[mid] : Number(((packages[mid - 1] + packages[mid]) / 2).toFixed(2));
  }

  const highestPackageLpa = packages.length > 0 ? Math.max(...packages) : 0;

  // Department-wise Stats
  const depts = Array.from(new Set(students.map(s => s.department)));
  const departmentStats = depts.map(dept => {
    const dStudents = students.filter(s => s.department === dept);
    const dPlaced = dStudents.filter(s => s.placement_status === 1);
    const dPkgs = dPlaced.map(s => s.package_lpa).filter(Boolean);
    const dAvgPkg = dPkgs.length > 0 ? dPkgs.reduce((a, b) => a + b, 0) / dPkgs.length : 0;

    return {
      department: dept,
      total: dStudents.length,
      placed: dPlaced.length,
      placementRate: Number(((dPlaced.length / dStudents.length) * 100).toFixed(1)),
      avgPackage: Number(dAvgPkg.toFixed(2))
    };
  });

  // Batch Trends
  const batches = Array.from(new Set(students.map(s => s.batch))).sort();
  const batchTrends = batches.map(b => {
    const bStudents = students.filter(s => s.batch === b);
    const bPlaced = bStudents.filter(s => s.placement_status === 1);
    const bPkgs = bPlaced.map(s => s.package_lpa).filter(Boolean);
    const bAvgPkg = bPkgs.length > 0 ? bPkgs.reduce((a, b) => a + b, 0) / bPkgs.length : 0;

    return {
      batch: b,
      total: bStudents.length,
      placed: bPlaced.length,
      placementRate: Number(((bPlaced.length / bStudents.length) * 100).toFixed(1)),
      avgPackage: Number(bAvgPkg.toFixed(2))
    };
  });

  // Package Distribution Histogram
  const packageBands = [
    { range: '< 5 LPA', count: packages.filter(p => p < 5).length },
    { range: '5 - 8 LPA', count: packages.filter(p => p >= 5 && p < 8).length },
    { range: '8 - 12 LPA', count: packages.filter(p => p >= 8 && p < 12).length },
    { range: '12 - 18 LPA', count: packages.filter(p => p >= 12 && p < 18).length },
    { range: '18+ LPA', count: packages.filter(p => p >= 18).length }
  ];

  // Top Skill Frequencies
  const skillFreq = await db.all(`
    SELECT sk.name as skill, COUNT(ss.student_id) as frequency
    FROM student_skills ss
    JOIN skills sk ON ss.skill_id = sk.id
    GROUP BY sk.name
    ORDER BY frequency DESC
    LIMIT 8
  `);

  return {
    totalStudents,
    placedStudents,
    unplacedStudents,
    overallPlacementPercentage,
    avgCgpaPlaced,
    avgCgpaUnplaced,
    avgCodingScore,
    avgAptitudeScore,
    avgCommScore,
    avgPackageLpa,
    medianPackageLpa,
    highestPackageLpa,
    departmentStats,
    batchTrends,
    packageDistribution: packageBands,
    skillDemandFrequency: skillFreq
  };
}
