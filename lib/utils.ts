/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function hashPassword(password: string, saltRounds = 16): string {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<void> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateToken(
  payload: object,
  userOptions: object,
): Promise<void> {
  const secretKey = process.env.AUTH_EZ_JWT_SECRET_KEY;
  const options =
    userOptions && Object.keys(userOptions)?.length
      ? userOptions
      : { expiresIn: '1h' };
  return jwt.sign(payload, secretKey, options);
}

export function verifyToken(token: string): any {
  try {
    const secretKey = process.env.AUTH_EZ_JWT_SECRET_KEY;
    console.log('jwt.verify(token, secretKey);', jwt.verify(token, secretKey));
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

// export function authenticateToken(req: Request, res: Response, next: NextFunction) {
//   const token = req.headers.authorization;
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const payload = verifyToken(token);
//     req.userId = payload.userId;
//     next();
//   } catch (error) {
//     console.info(error);
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// }

// export function authorize(role: string, User: User) {
//   return async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
//     try {
//       const user = await User.findById(req.userId);
//       if (!user || user.role !== role) {
//         return res.status(403).json({ error: 'Forbidden' });
//       }
//       next();
//     } catch (error) {
//       console.info(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };
// }
