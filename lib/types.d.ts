import { EmailService } from '.';
export interface IUser {
    [x: string]: any;
    username: string;
    password: string;
    email: string;
}
export type Config = {
    User: any;
    enableLogs?: boolean;
    hashPassword?: any;
    comparePassword?: typeof Function;
    generateToken?: any;
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
};
export type ErrResponse = {
    code?: number;
    error?: string;
};
export type UpdateUser = {
    id: string | number;
    password: string;
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
