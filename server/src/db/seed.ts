import bcrypt from 'bcryptjs';
import { getDb, initDb } from './database.js';

const DEPARTMENTS = ['Computer Science & Engineering', 'Information Technology', 'Electronics & Comm', 'Mechanical Engineering', 'Civil Engineering'];
const BATCHES = ['2023', '2024', '2025', '2026'];
const TARGET_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Data Analyst',
  'DevOps Engineer',
  'Cloud Architect',
  'Embedded Systems Engineer',
  'QA Automation Engineer',
  'UI/UX Designer',
  'Cybersecurity Analyst'
];

const SKILLS_LIST = [
  { name: 'Java', category: 'Technical' },
  { name: 'Python', category: 'Technical' },
  { name: 'JavaScript / TypeScript', category: 'Technical' },
  { name: 'React.js', category: 'Framework' },
  { name: 'Node.js / Express', category: 'Framework' },
  { name: 'SQL & Database Design', category: 'Technical' },
  { name: 'Data Structures & Algorithms', category: 'Technical' },
  { name: 'Git & Version Control', category: 'Technical' },
  { name: 'Spring Boot', category: 'Framework' },
  { name: 'Docker & Kubernetes', category: 'Technical' },
  { name: 'AWS / Cloud Computing', category: 'Technical' },
  { name: 'RESTful API Design', category: 'Technical' },
  { name: 'Verilog / Embedded C', category: 'Technical' },
  { name: 'Problem Solving', category: 'Soft' },
  { name: 'Communication & Verbal', category: 'Soft' },
  { name: 'Team Collaboration', category: 'Soft' }
];

const COMPANY_PROFILES = [
  { name: 'Google Cloud Labs', role: 'Software Engineer', minCgpa: 8.5, aptitude: 85, coding: 88, comm: 80, intern: 1, minPkg: 18.0, maxPkg: 28.0 },
  { name: 'Microsoft Enterprise', role: 'Cloud Architect', minCgpa: 8.2, aptitude: 82, coding: 85, comm: 82, intern: 1, minPkg: 16.0, maxPkg: 25.0 },
  { name: 'Amazon AWS', role: 'Full Stack Developer', minCgpa: 8.0, aptitude: 80, coding: 82, comm: 78, intern: 1, minPkg: 14.0, maxPkg: 22.0 },
  { name: 'Atlassian Systems', role: 'DevOps Engineer', minCgpa: 7.8, aptitude: 78, coding: 80, comm: 75, intern: 1, minPkg: 12.0, maxPkg: 18.0 },
  { name: 'Deloitte Tech Consulting', role: 'Data Analyst', minCgpa: 7.2, aptitude: 75, coding: 70, comm: 80, intern: 0, minPkg: 8.0, maxPkg: 12.0 },
  { name: 'TCS Digital', role: 'Software Engineer', minCgpa: 7.0, aptitude: 70, coding: 72, comm: 70, intern: 0, minPkg: 7.0, maxPkg: 9.0 },
  { name: 'Infosys Specialist', role: 'Full Stack Developer', minCgpa: 6.8, aptitude: 68, coding: 70, comm: 68, intern: 0, minPkg: 6.5, maxPkg: 8.5 },
  { name: 'Wipro Turbo', role: 'QA Automation Engineer', minCgpa: 6.5, aptitude: 65, coding: 65, comm: 65, intern: 0, minPkg: 5.5, maxPkg: 7.5 },
  { name: 'Accenture Tech', role: 'Software Engineer', minCgpa: 6.5, aptitude: 65, coding: 65, comm: 70, intern: 0, minPkg: 5.0, maxPkg: 7.0 },
  { name: 'Cognizant GenC', role: 'Software Engineer', minCgpa: 6.0, aptitude: 60, coding: 60, comm: 60, intern: 0, minPkg: 4.2, maxPkg: 6.0 }
];

function randomGaussian(mean: number, stdev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + num * stdev;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export async function seedDatabase() {
  await initDb();
  const db = await getDb();

  console.log('Seeding database with synthetic records...');

  // Clear existing tables
  await db.exec(`
    DELETE FROM predictions;
    DELETE FROM recommendations;
    DELETE FROM student_skills;
    DELETE FROM company_skills;
    DELETE FROM users;
    DELETE FROM students;
    DELETE FROM companies;
    DELETE FROM skills;
    DELETE FROM job_roles;
    DELETE FROM departments;
  `);

  // Insert Departments
  for (const dept of DEPARTMENTS) {
    const code = dept.split(' ').map(w => w[0]).join('');
    await db.run('INSERT INTO departments (code, name) VALUES (?, ?)', [code, dept]);
  }

  // Insert Skills
  const skillIds: Record<string, number> = {};
  for (const sk of SKILLS_LIST) {
    const res = await db.run('INSERT INTO skills (name, category) VALUES (?, ?)', [sk.name, sk.category]);
    skillIds[sk.name] = res.lastID!;
  }

  // Insert Job Roles
  for (const role of TARGET_ROLES) {
    await db.run('INSERT INTO job_roles (title, category, description) VALUES (?, ?, ?)', [
      role,
      'Engineering',
      `Target role for ${role}`
    ]);
  }

  // Insert Companies
  const companyIds: number[] = [];
  for (const comp of COMPANY_PROFILES) {
    const res = await db.run(`
      INSERT INTO companies (company_name, job_role, minimum_cgpa, aptitude_requirement, coding_requirement, communication_requirement, internship_preference, package_min, package_max, selection_count, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [comp.name, comp.role, comp.minCgpa, comp.aptitude, comp.coding, comp.comm, comp.intern, comp.minPkg, comp.maxPkg, Math.floor(Math.random() * 25) + 10, 2024]);
    
    companyIds.push(res.lastID!);

    // Attach required skills to company
    const reqSkills = ['Java', 'SQL & Database Design', 'Data Structures & Algorithms', 'Problem Solving'];
    for (const skName of reqSkills) {
      if (skillIds[skName]) {
        await db.run('INSERT OR IGNORE INTO company_skills (company_id, skill_id, is_required) VALUES (?, ?, 1)', [res.lastID, skillIds[skName]]);
      }
    }
  }

  // Seed 520 Synthetic Students
  const totalStudents = 520;
  console.log(`Generating ${totalStudents} statistically correlated synthetic student profiles...`);

  const studentDbIds: number[] = [];

  for (let i = 1; i <= totalStudents; i++) {
    const student_id = `CN2024${String(i).padStart(4, '0')}`;
    const name = `Student ${i}`;
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const batch = BATCHES[i % BATCHES.length];
    const target_role = TARGET_ROLES[i % TARGET_ROLES.length];

    // Statistical correlated values
    const baseAbility = randomGaussian(0, 1); // standard normal latent trait
    
    const cgpa = Number(clamp(7.5 + baseAbility * 0.9, 5.0, 9.9).toFixed(2));
    const attendance_percentage = Number(clamp(82 + baseAbility * 6 + randomGaussian(0, 4), 60, 99).toFixed(1));
    const aptitude_score = Number(clamp(70 + baseAbility * 12 + randomGaussian(0, 5), 35, 98).toFixed(1));
    const coding_score = Number(clamp(68 + baseAbility * 14 + randomGaussian(0, 6), 30, 99).toFixed(1));
    const communication_score = Number(clamp(72 + baseAbility * 10 + randomGaussian(0, 5), 40, 96).toFixed(1));
    const technical_score = Number(clamp(69 + baseAbility * 12 + randomGaussian(0, 5), 35, 98).toFixed(1));
    
    const number_of_projects = Math.max(0, Math.round(2.5 + baseAbility * 1.2 + Math.random()));
    const internship_status = baseAbility > -0.2 ? 1 : 0;
    const internship_count = internship_status === 1 ? Math.max(1, Math.round(1.5 + baseAbility * 0.8)) : 0;
    const certifications_count = Math.max(0, Math.round(1.8 + baseAbility * 1.0));
    
    const resume_score = Number(clamp(70 + baseAbility * 10 + randomGaussian(0, 5), 45, 95).toFixed(1));
    const interview_score = Number(clamp(68 + baseAbility * 12 + randomGaussian(0, 6), 40, 96).toFixed(1));

    // Calculate synthetic readiness score
    const readiness_score = Number((
      (cgpa / 10 * 100) * 0.25 +
      coding_score * 0.25 +
      aptitude_score * 0.15 +
      communication_score * 0.15 +
      Math.min(number_of_projects / 5 * 100, 100) * 0.10 +
      (internship_status ? 100 : 0) * 0.10
    ).toFixed(1));

    // Placement status & company correlation
    let placement_status = 0;
    let placed_company: string | null = null;
    let package_lpa: number | null = null;

    if (batch === '2023' || batch === '2024') {
      // Historical batch - place based on readiness threshold
      if (readiness_score >= 68) {
        placement_status = 1;
        // Select matched company profile based on scores
        const eligibleCompanies = COMPANY_PROFILES.filter(c => cgpa >= c.minCgpa && coding_score >= c.coding - 5);
        const selectedCompany = eligibleCompanies.length > 0 ? eligibleCompanies[0] : COMPANY_PROFILES[COMPANY_PROFILES.length - 1];
        placed_company = selectedCompany.name;
        package_lpa = Number(clamp(selectedCompany.minPkg + (readiness_score / 100) * (selectedCompany.maxPkg - selectedCompany.minPkg), selectedCompany.minPkg, selectedCompany.maxPkg).toFixed(2));
      }
    } else {
      // Current batches (2025, 2026) - prospective
      if (readiness_score >= 82 && Math.random() > 0.4) {
        placement_status = 1;
        placed_company = 'Amazon AWS';
        package_lpa = 16.5;
      }
    }

    // Risk level classification
    let risk_level = 'Low';
    if (readiness_score < 55) risk_level = 'Critical';
    else if (readiness_score < 65) risk_level = 'High';
    else if (readiness_score < 75) risk_level = 'Medium';

    const res = await db.run(`
      INSERT INTO students (
        student_id, name, department, batch, cgpa, attendance_percentage,
        aptitude_score, coding_score, communication_score, technical_score,
        number_of_projects, internship_status, internship_count, certifications_count,
        resume_score, interview_score, placement_status, placed_company, package_lpa,
        target_role, readiness_score, ml_placement_likelihood, risk_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, name, department, batch, cgpa, attendance_percentage,
      aptitude_score, coding_score, communication_score, technical_score,
      number_of_projects, internship_status, internship_count, certifications_count,
      resume_score, interview_score, placement_status, placed_company, package_lpa,
      target_role, readiness_score, readiness_score / 100, risk_level
    ]);

    const sDbId = res.lastID!;
    studentDbIds.push(sDbId);

    // Seed student skills
    const numSkills = Math.floor(Math.random() * 5) + 4;
    const shuffledSkills = Object.values(skillIds).sort(() => 0.5 - Math.random());
    for (let k = 0; k < numSkills; k++) {
      const prof = Math.min(5, Math.max(1, Math.round((readiness_score / 20) + (Math.random() * 2 - 1))));
      await db.run('INSERT OR IGNORE INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?)', [sDbId, shuffledSkills[k], prof]);
    }
  }

  // Seed Demo Accounts
  console.log('Seeding demo user credentials...');
  const passwordHash = await bcrypt.hash('demo1234', 10);

  // Admin Account
  await db.run(`
    INSERT INTO users (email, password_hash, role)
    VALUES (?, ?, ?)
  `, ['admin@careernexus.demo', passwordHash, 'Admin']);

  // Student Demo Account (linked to student #1)
  await db.run(`
    INSERT INTO users (email, password_hash, role, student_db_id)
    VALUES (?, ?, ?, ?)
  `, ['student@careernexus.demo', passwordHash, 'Student', studentDbIds[0]]);

  console.log('Seeding completed successfully!');
  console.log('Demo Credentials:');
  console.log('  Admin:   admin@careernexus.demo / demo1234');
  console.log('  Student: student@careernexus.demo / demo1234');
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase().catch(err => {
    console.error('Failed to seed database:', err);
    process.exit(1);
  });
}
