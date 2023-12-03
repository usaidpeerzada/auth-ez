/* eslint-disable @typescript-eslint/no-explicit-any */
export type User = {
  [x: string]: any;
  username: string;
  password: string;
  email: string;
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
  id?: string;
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
