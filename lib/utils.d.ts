import { NextFunction, Request, Response } from 'express';
export interface IUserInfoRequest extends Request {
    user: string;
}
export declare function hashPassword(password: string, saltRounds?: number): Promise<string>;
export declare function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
export declare function generateToken(payload: object, userOptions: object): string;
export declare function verifyToken(token: string): any;
export declare function protectedRoutes(routes: object, User: any): (req: IUserInfoRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function createResponse(res: Response, code: number, message: object): any;
export declare function markEmailAsVerified(userId: string, User: any): Promise<void>;
export declare function generateRefreshToken(userId: string): string;
export declare function verifyRefreshToken(token: string): any;
export declare function isNullOrEmpty(value: any): boolean;
