import express, { Request, Response } from 'express';
import IAuthEZDataStore from './authEZDataStore';
import { Config, GetUser, SaveUser, UpdateUser, IUser } from './types';
export declare abstract class AuthController implements IAuthEZDataStore {
    private readonly config;
    private readonly router;
    private readonly emailOptions;
    private readonly response;
    readonly User: any;
    constructor(config: Config);
    abstract saveUser(params: SaveUser): Promise<IUser>;
    abstract getUser(params: GetUser): Promise<IUser>;
    abstract updateUser(params: UpdateUser): Promise<IUser>;
    private sendEmail;
    hashPassword(password: string, options?: object): string;
    private comparePassword;
    private generateToken;
    loginWithEmail(req: Request, res: Response): Promise<Response>;
    loginWithUsername(req: Request, res: Response): Promise<Response>;
    forgotPasswordRoute(req: Request, res: Response): Promise<Response>;
    resetPasswordRoute(req: Request, res: Response): Promise<void>;
    signUpRoute(req: Request, res: Response): Promise<void>;
    logoutRoute(req: Request, res: Response): void;
    getRouter(): express.Router;
}
