import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.js';
import { mlPipeline } from '../ml/pipeline.js';
import { getPlacementAnalytics } from '../services/analyticsService.js';
import { analyzeSkillGap } from '../services/skillGapService.js';
import { matchCompaniesForStudent } from '../services/companyMatchService.js';
import { getInterventionList } from '../services/interventionService.js';
import { getScoringWeights, updateScoringWeights, calculateRuleBasedReadinessScore } from '../services/scoringService.js';
import { FeatureKey } from '../ml/logisticRegression.js';

export const router = Router();

// Authentication Endpoints
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      studentDbId: user.student_db_id
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentDbId: user.student_db_id
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.get('/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

// Student Endpoints
router.get('/students', authenticateToken, async (req, res) => {
  try {
    const { batch, department, status, search } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];

    if (batch && batch !== 'All') {
      query += ' AND batch = ?';
      params.push(batch);
    }
    if (department && department !== 'All') {
      query += ' AND department = ?';
      params.push(department);
    }
    if (status && status !== 'All') {
      const pStatus = status === 'Placed' ? 1 : 0;
      query += ' AND placement_status = ?';
      params.push(pStatus);
    }
    if (search) {
      query += ' AND (name LIKE ? OR student_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY readiness_score DESC LIMIT 200';

    const students = await db.all(query, params);
    return res.json({ students });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/students/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const student = await db.get('SELECT * FROM students WHERE id = ?', [req.params.id]);

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // Attach student skills
    const skills = await db.all(`
      SELECT sk.name, sk.category, ss.proficiency
      FROM student_skills ss
      JOIN skills sk ON ss.skill_id = sk.id
      WHERE ss.student_id = ?
    `, [student.id]);

    // Recalculate live prediction & explanation
    const weights = await getScoringWeights();
    const readinessScore = calculateRuleBasedReadinessScore(student, weights);
    
    const mlResult = mlPipeline.predictStudentLikelihood(student as unknown as Partial<Record<FeatureKey, number>>);

    return res.json({
      student: {
        ...student,
        readiness_score: readinessScore,
        ml_placement_likelihood: mlResult.likelihood
      },
      skills,
      explanation: mlResult.explanation,
      modelUsed: mlResult.modelUsed
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Analytics Dashboard Endpoint
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { batch, department, targetRole } = req.query;
    const analytics = await getPlacementAnalytics({
      batch: batch as string,
      department: department as string,
      targetRole: targetRole as string
    });
    return res.json(analytics);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Machine Learning Workbench Endpoints
router.get('/ml/metrics', authenticateToken, async (req, res) => {
  try {
    return res.json({
      activeModel: mlPipeline.activeModelName,
      evaluations: mlPipeline.evaluations,
      disclaimer: 'Estimated placement likelihood based on historical training data.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/ml/clusters', authenticateToken, async (req, res) => {
  try {
    return res.json({ clusters: mlPipeline.clusterSummaries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/ml/predict', authenticateToken, async (req, res) => {
  try {
    const features = req.body;
    const weights = await getScoringWeights();
    const readinessScore = calculateRuleBasedReadinessScore(features, weights);
    const mlResult = mlPipeline.predictStudentLikelihood(features);

    return res.json({
      readinessScore,
      mlPlacementLikelihood: mlResult.likelihood,
      modelUsed: mlResult.modelUsed,
      explanation: mlResult.explanation,
      disclaimer: 'Estimated placement likelihood based on historical training data.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// What-If Career Simulator Endpoint
router.post('/ml/what-if', authenticateToken, async (req, res) => {
  try {
    const { current, hypothetical } = req.body;
    const weights = await getScoringWeights();

    const currentReadiness = calculateRuleBasedReadinessScore(current, weights);
    const simulatedReadiness = calculateRuleBasedReadinessScore(hypothetical, weights);

    const currentMl = mlPipeline.predictStudentLikelihood(current);
    const simulatedMl = mlPipeline.predictStudentLikelihood(hypothetical);

    const readinessDelta = Number((simulatedReadiness - currentReadiness).toFixed(1));
    const likelihoodDelta = Number((simulatedMl.likelihood - currentMl.likelihood).toFixed(4));

    return res.json({
      currentReadinessScore: currentReadiness,
      simulatedReadinessScore: simulatedReadiness,
      readinessDelta,
      currentLikelihood: currentMl.likelihood,
      simulatedLikelihood: simulatedMl.likelihood,
      likelihoodDelta,
      modelUsed: currentMl.modelUsed,
      disclaimer: 'Simulation based on trained statistical model and not a guaranteed future outcome.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Skill Gap & Company Match Endpoints
router.get('/skill-gap', authenticateToken, async (req, res) => {
  try {
    const { studentId, targetRole } = req.query;
    if (!studentId || !targetRole) {
      return res.status(400).json({ error: 'studentId and targetRole parameters are required.' });
    }
    const result = await analyzeSkillGap(Number(studentId), targetRole as string);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/company-match', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required.' });
    }
    const matches = await matchCompaniesForStudent(Number(studentId));
    return res.json({ matches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Intervention Endpoints
router.get('/interventions', authenticateToken, async (req, res) => {
  try {
    const list = await getInterventionList();
    return res.json({ interventions: list });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Scoring Config Endpoints
router.get('/scoring/weights', authenticateToken, async (req, res) => {
  try {
    const weights = await getScoringWeights();
    return res.json({ weights });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/scoring/weights', authenticateToken, async (req, res) => {
  try {
    await updateScoringWeights(req.body);
    return res.json({ message: 'Scoring configuration updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CSV Export Endpoint
router.get('/reports/export-csv', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const students = await db.all('SELECT * FROM students ORDER BY student_id ASC');

    let csvContent = 'Student_ID,Name,Department,Batch,CGPA,Aptitude,Coding,Communication,Readiness_Score,Risk_Level,Placement_Status,Placed_Company,Package_LPA\n';

    students.forEach(s => {
      const statusStr = s.placement_status === 1 ? 'Placed' : 'Unplaced';
      csvContent += `"${s.student_id}","${s.name}","${s.department}","${s.batch}",${s.cgpa},${s.aptitude_score},${s.coding_score},${s.communication_score},${s.readiness_score},"${s.risk_level}","${statusStr}","${s.placed_company || ''}",${s.package_lpa || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="CareerNexus_Placement_Report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
