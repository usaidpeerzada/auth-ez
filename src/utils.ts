/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function hashPassword(
  password: string,
  saltRounds = 16,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateToken(payload: object, userOptions: object): string {
  const secretKey = process.env.JWT_SECRET_KEY;
  const options =
    userOptions && Object.keys(userOptions)?.length
      ? userOptions
      : { expiresIn: '1h' };
  return jwt.sign(payload, secretKey, options);
}

export function verifyToken(token: string): any {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    return jwt.verify(token, secretKey);
  } catch (err) {
    return { message: err, status: 401 };
  }
}

export function protectedRoutes(routes: object) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const unprotectedRoutes = routes && Object.values(routes);
    if (unprotectedRoutes.includes(req.path)) {
      return next();
    }
    if (!token || !verifyToken(token) || verifyToken(token)?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized', code: 401 });
    }
    next();
  };
}

export function createResponse(
  res: Response,
  code: number,
  message: object,
): any {
  res.status(code).json({ ...message, code });
}
