import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'careernexus_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'Admin' | 'Student';
    studentDbId?: number;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(role: 'Admin' | 'Student') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role} permission required.` });
    }
    next();
  };
}

export function generateToken(payload: AuthRequest['user']): string {
  return jwt.sign(payload!, JWT_SECRET, { expiresIn: '24h' });
}
