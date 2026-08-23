import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getDb } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { mlPipeline } from './ml/pipeline.js';
import { router as apiRouter } from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Router
app.use('/api', apiRouter);

// Serve static frontend files if production build exists
const publicPath = path.join(__dirname, '../../dist');
app.use(express.static(publicPath));

async function startServer() {
  try {
    console.log('Initializing CareerNexus database...');
    await initDb();

    // Check if database needs seeding
    const db = await getDb();
    const studentCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM students');

    if (!studentCount || studentCount.count === 0) {
      console.log('Database empty. Running seed generator...');
      await seedDatabase();
    }

    // Train ML pipeline on startup
    console.log('Training machine learning model benchmarks...');
    await mlPipeline.trainAndEvaluateAll();

    app.listen(PORT, () => {
      console.log(`==================================================================`);
      console.log(`  CareerNexus Server running on http://localhost:${PORT}`);
      console.log(`  REST API available at http://localhost:${PORT}/api`);
      console.log(`==================================================================`);
    });
  } catch (err) {
    console.error('Failed to start CareerNexus server:', err);
    process.exit(1);
  }
}

startServer();
