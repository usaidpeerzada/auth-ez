/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmailService } from '.';
import { User } from './types';

export type Config = {
  User: User;
  enableLogs?: boolean;
  hashPassword?;
  comparePassword?: typeof Function;
  generateToken?;
  tokenOptions?: {
    expiresIn?: string;
  };
  routeNames: {
    loginWithEmailRoute?: string;
    loginWithUsernameRoute?: string;
    signupRoute?: string;
    forgotPasswordRoute?: string;
    resetPasswordRoute?: string;
    logoutRoute?: string;
  };
  emailOptions?: {
    enableEmail?: boolean;
    emailType?: string;
    emailSdk?: any;
    forgotPasswordSubject?: string;
    forgotPasswordBody?: string;
    verificationMailSubject?: string;
    verificationMailBody?: string;
    emailService?: EmailService;
  };
};
