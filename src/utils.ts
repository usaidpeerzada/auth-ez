/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
export interface IUserInfoRequest extends Request {
  user: string;
}

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

export function protectedRoutes(routes: object, User) {
  return async (
    req: IUserInfoRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response<any, Record<string, any>>> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const unprotectedRoutes = routes && Object.values(routes);
    if (unprotectedRoutes.includes(req.path)) {
      return next();
    }
    const payload = verifyToken(token);
    if (!token || !verifyToken(token) || verifyToken(token)?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized', code: 401 });
    }
    const user = await User.findById(payload.userId)
      .select('-password')
      .lean()
      .exec();
    if (!user) {
      return res.status(401).end();
    }
    req.user = user;
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

export async function markEmailAsVerified(userId: string, User): Promise<void> {
  try {
    await User.updateOne({ _id: userId }, { emailVerified: true });
  } catch (error) {
    console.error('Error marking email as verified:', error);
    throw new Error('Failed to mark email as verified');
  }
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

export function isNullOrEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (Object.keys(value).length === 0) {
      return true;
    }
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  return false;
}
