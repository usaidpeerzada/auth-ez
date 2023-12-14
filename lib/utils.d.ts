import { NextFunction, Request, Response } from 'express';
export declare function hashPassword(password: string, saltRounds?: number): Promise<string>;
export declare function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
export declare function generateToken(payload: object, userOptions: object): string;
export declare function verifyToken(token: string): any;
export declare function protectedRoutes(routes: object): (req: Request, res: Response, next: NextFunction) => void | Response;
export declare function createResponse(res: Response, code: number, message: object): any;
