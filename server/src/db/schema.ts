export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL -- 'Technical', 'Language', 'Soft', 'Framework'
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  job_role TEXT NOT NULL,
  minimum_cgpa REAL NOT NULL,
  aptitude_requirement REAL NOT NULL,
  coding_requirement REAL NOT NULL,
  communication_requirement REAL NOT NULL,
  internship_preference INTEGER DEFAULT 0, -- 1 if preferred
  package_min REAL NOT NULL,
  package_max REAL NOT NULL,
  selection_count INTEGER DEFAULT 0,
  year INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS company_skills (
  company_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  is_required INTEGER DEFAULT 1, -- 1 for required, 0 for preferred
  PRIMARY KEY (company_id, skill_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  batch TEXT NOT NULL,
  cgpa REAL NOT NULL,
  attendance_percentage REAL NOT NULL,
  aptitude_score REAL NOT NULL,
  coding_score REAL NOT NULL,
  communication_score REAL NOT NULL,
  technical_score REAL NOT NULL,
  number_of_projects INTEGER NOT NULL,
  internship_status INTEGER NOT NULL, -- 0 or 1
  internship_count INTEGER NOT NULL,
  certifications_count INTEGER NOT NULL,
  resume_score REAL NOT NULL,
  interview_score REAL NOT NULL,
  placement_status INTEGER NOT NULL DEFAULT 0, -- 0 Unplaced, 1 Placed
  placed_company TEXT,
  package_lpa REAL,
  target_role TEXT NOT NULL,
  readiness_score REAL DEFAULT 0,
  ml_placement_likelihood REAL DEFAULT 0,
  risk_level TEXT DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Critical'
  cluster_name TEXT DEFAULT 'Unassigned'
);

CREATE TABLE IF NOT EXISTS student_skills (
  student_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency INTEGER DEFAULT 3, -- 1 to 5
  PRIMARY KEY (student_id, skill_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Admin', 'Student'
  student_db_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_db_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  model_used TEXT NOT NULL,
  predicted_likelihood REAL NOT NULL,
  readiness_score REAL NOT NULL,
  positive_factors TEXT NOT NULL, -- JSON array
  improvement_areas TEXT NOT NULL, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  priority INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scoring_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cgpa_weight REAL DEFAULT 0.25,
  coding_weight REAL DEFAULT 0.25,
  aptitude_weight REAL DEFAULT 0.15,
  comm_weight REAL DEFAULT 0.15,
  project_weight REAL DEFAULT 0.10,
  internship_weight REAL DEFAULT 0.10,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance analytics queries
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch);
CREATE INDEX IF NOT EXISTS idx_students_placed ON students(placement_status);
CREATE INDEX IF NOT EXISTS idx_students_target_role ON students(target_role);
`;
