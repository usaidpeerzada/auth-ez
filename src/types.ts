/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmailService } from '.';

export interface IUser {
  [x: string]: any;
  username: string;
  password: string;
  email: string;
  loginAttempts: number;
  lockUntil: number;
}

export type Config = {
  User;
  enableLogs?: boolean;
  hashPassword?;
  comparePassword?: typeof Function;
  generateToken?;
  tokenOptions?: {
    expiresIn?: string;
  };
  routeNames?: {
    loginWithEmailRoute?: string;
    loginWithUsernameRoute?: string;
    signupRoute?: string;
    forgotPasswordRoute?: string;
    resetPasswordRoute?: string;
    logoutRoute?: string;
    verifyEmail?: string;
    resendVerificationEmail?: string;
    refreshToken?: string;
  };
  emailOptions?: {
    enableEmail: boolean;
    emailType: string;
    emailSdk: any;
    forgotPasswordSubject?: string;
    forgotPasswordBody?: string;
    verificationMailSubject?: string;
    verificationMailBody?: string;
    emailService?: EmailService;
  };
  enableRefreshToken?: boolean;
  refreshTokenOptions?: {
    useCookie?: boolean;
    cookieOptions?: object;
  };
  rateLimitOptions?: {
    windowMs?: number;
    max?: number;
  };
};

export type ErrResponse = {
  code?: number;
  error?: string;
};

export type UpdateUser = {
  id: string | number;
  password?: string;
  refreshToken?: string;
  loginAttempts?: number;
  lockUntil?: number;
};

export type SaveUser = {
  username: string;
  password: string;
  email: string;
};

export type GetUser = {
  email?: string;
  username?: string;
  id?: string | number;
};

export type SuccessResponse = {
  [x: string]: any;
  message?: string | object;
  code?: number;
  refreshToken?: string;
};

export type EmailOptions = {
  enableEmail?: boolean;
  emailType?: string;
  emailSdk?: any;
  emailService?: any;
  forgotPasswordSubject?: string;
  forgotPasswordBody?: string;
  verificationMailSubject?: string;
  verificationMailBody?: string;
};

export type EmailParams = {
  toMail: string;
  mailType: string;
  url: string;
  mailSubject?: string;
  mailBody?: string;
};

export interface PasswordValidationRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}
