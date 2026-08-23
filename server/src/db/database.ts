import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.join(__dirname, '../../careernexus.db');
  
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec('PRAGMA foreign_keys = ON;');
  return dbInstance;
}

export async function initDb() {
  const db = await getDb();
  await db.exec(SCHEMA_SQL);

  // Initialize default scoring config if empty
  const config = await db.get('SELECT * FROM scoring_config LIMIT 1');
  if (!config) {
    await db.run(`
      INSERT INTO scoring_config (cgpa_weight, coding_weight, aptitude_weight, comm_weight, project_weight, internship_weight)
      VALUES (0.25, 0.25, 0.15, 0.15, 0.10, 0.10)
    `);
  }

  console.log('Database initialized successfully.');
}
