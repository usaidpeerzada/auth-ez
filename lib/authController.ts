/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, Router } from 'express';
import IAuthEZDataStore from './authEZDataStore';
import {
  comparePasswords,
  generateToken,
  hashPassword,
  verifyToken,
} from './utils';
import { Config } from './types';
import {
  EmailOptions,
  EmailParams,
  GetUser,
  SaveUser,
  UpdateUser,
  IUser,
} from './types';
import EmailService from './emails/emailService';
import ResendEmailService from './emails/resendEmailService';
import { emailTypes } from './constants';
import NodemailerEmailService from './emails/nodemailerEmailService';
import { protectedRoutes } from './utils';
import ResponseController from './responseController';
export abstract class AuthController implements IAuthEZDataStore {
  private config: Config;
  private router: Router;
  private emailOptions: EmailOptions;
  private response: ResponseController;
  User;

  constructor(config: Config) {
    this.config = config;
    const routes = {
      emailLoginRoute:
        config.routeNames?.loginWithEmailRoute || '/login-with-email',
      usernameLoginRoute:
        config.routeNames?.loginWithUsernameRoute || '/login-with-username',
      forgotPasswordRoute:
        config.routeNames?.forgotPasswordRoute || '/forgot-password',
      resetPasswordRoute:
        config.routeNames?.resetPasswordRoute || '/reset-password',
      signupRoute: config.routeNames?.signupRoute || '/register',
      logoutRoute: config.routeNames?.logoutRoute || '/logout',
    };
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(protectedRoutes(routes));
    this.User = config.User;
    this.emailOptions = this.config.emailOptions;
    this.response = new ResponseController();
    this.router.post(
      `${routes.emailLoginRoute}`,
      this.loginWithEmail.bind(this),
    );
    this.router.post(
      `${routes.usernameLoginRoute}`,
      this.loginWithUsername.bind(this),
    );
    this.router.post(
      `${routes.forgotPasswordRoute}`,
      this.forgotPasswordRoute.bind(this),
    );
    this.router.post(
      `${routes.resetPasswordRoute}`,
      this.resetPasswordRoute.bind(this),
    );
    this.router.post(`${routes.signupRoute}`, this.signUpRoute.bind(this));
    this.router.post(`${routes.logoutRoute}`, this.logoutRoute.bind(this));
  }

  hashPassword(password: string, options: object): string {
    let hashedPassword: string;
    if (this.config.hashPassword) {
      hashedPassword = this.config.hashPassword(password, options);
    } else {
      hashedPassword = hashPassword(password);
    }
    return hashedPassword;
  }

  abstract saveUser(params: SaveUser): Promise<IUser>;
  abstract getUser(params: GetUser): Promise<IUser>;
  abstract updateUser(params: UpdateUser): Promise<IUser>;

  async sendEmail(params: object): Promise<void | boolean> {
    if (
      this.emailOptions &&
      Object.keys(this.emailOptions).length &&
      this.emailOptions.emailType !== '' &&
      this.emailOptions.emailSdk
    ) {
      let emailService: any;
      if (this.emailOptions?.emailType === emailTypes.NODEMAILER) {
        const nodemailerConfig = new NodemailerEmailService(
          this.emailOptions?.emailSdk,
        );
        emailService = new EmailService({ emailClient: nodemailerConfig });
      } else if (this.emailOptions?.emailType === emailTypes.RESEND) {
        const resendConfig = new ResendEmailService(
          this.emailOptions?.emailSdk,
        );
        emailService = new EmailService({ emailClient: resendConfig });
      } else {
        emailService = this.emailOptions.emailService;
      }
      emailService.sendEmail(params);
    }
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    let comparedPassword;
    if (this.config.comparePassword) {
      comparedPassword = await this.config.comparePassword(
        plainPassword,
        hashedPassword,
      );
    } else {
      console.log('compare password -> ', { plainPassword, hashedPassword });
      comparedPassword = await comparePasswords(plainPassword, hashedPassword);
    }
    return comparedPassword;
  }

  generateToken(payload: object, userOptions: object): Promise<void> {
    if (this.config.generateToken) {
      return this.config.generateToken(payload, userOptions);
    } else {
      return generateToken(payload, userOptions);
    }
  }

  async loginWithEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const user = await this.getUser({ email });
      if (!email || !password) {
        return this.response.clientError(res, {
          error: 'All fields are required!',
        });
      }
      console.log('the user inside authcontroller -> ', { user, password });
      if (!user) {
        return this.response.notFound(res, { error: 'User not found!' });
      }
      const comparePasswordWithHash = await this.comparePassword(
        password,
        user?.password,
      );
      console.log('compared password: ', comparePasswordWithHash);
      if (user && comparePasswordWithHash) {
        const token = this.generateToken(
          { userId: user._id || user.id },
          this.config?.tokenOptions,
        );
        return this.response.success(res, {
          message: 'Login successful',
          token,
        });
      } else {
        return this.response.unauthorized(res, {
          error: 'Invalid credentials',
        });
      }
    } catch (err) {
      this.config.enableLogs &&
        console.info(`Error in route: ${req.path}: `, err);
      return this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  async loginWithUsername(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;
      const user = await this.getUser({ username });
      if (!user) {
        return this.response.notFound(res, { error: 'User not found!' });
      }
      const comparePasswordWithHash = await this.comparePassword(
        password,
        user?.password,
      );
      if (user && comparePasswordWithHash) {
        const token = generateToken(
          { userId: user._id },
          this.config?.tokenOptions,
        );
        return this.response.success(res, {
          message: 'Login successful',
          token,
        });
      } else {
        return this.response.unauthorized(res, {
          error: 'Invalid credentials',
        });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      return this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  async forgotPasswordRoute(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await this.getUser({ email });
      if (user) {
        const resetToken = this.generateToken(
          { userId: user._id || user.id },
          this.config?.tokenOptions,
        );
        const url = `${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`;
        let mailParams: EmailParams = {
          toMail: user?.email,
          mailType: 'reset',
          url,
        };
        if (
          this.emailOptions?.forgotPasswordSubject ||
          this.emailOptions?.forgotPasswordBody
        ) {
          mailParams = {
            ...mailParams,
            mailSubject: this.emailOptions?.forgotPasswordSubject,
            mailBody: this.emailOptions?.forgotPasswordBody,
          };
        }
        this.sendEmail(mailParams);
        this.response.success(res, { message: 'Password reset email sent' });
      } else {
        this.response.notFound(res, { error: 'User not found' });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  async resetPasswordRoute(req: Request, res: Response): Promise<void> {
    try {
      const { newPassword } = req.body;
      const { token } = req.query;
      const payload = verifyToken(token.toString());
      const user = await this.getUser({ id: payload.userId });
      if (user) {
        const confirmUserId = user?.id || user?._id === payload.userId;
        console.log('user in reset ', user, confirmUserId);
        const hashedPassword = await hashPassword(newPassword);
        await this.updateUser({
          id: user?.id || user?._id,
          password: hashedPassword,
        });
        this.response.success(res, { message: 'Password reset successful' });
      } else {
        this.response.notFound(res, { error: 'User not found' });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  async signUpRoute(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      if (!email || !username || !password) {
        this.response.clientError(res, { error: 'All fields are required!' });
        return;
      }
      const existingUser = await this.getUser({
        email,
        username,
      });
      if (existingUser) {
        this.response.clientError(res, {
          error: 'Username or email already exists',
        });
        return;
      }
      const hashedPassword = this.config?.hashPassword
        ? await this.config?.hashPassword(password)
        : await hashPassword(password);
      console.log('>>>>', hashedPassword);
      const user = await this.saveUser({
        username,
        email,
        password: hashedPassword,
      });
      if (this.config?.emailOptions?.enableEmail) {
        const verificationToken = generateToken(
          { userId: user._id || user.id },
          this.config?.tokenOptions,
        );
        const url = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
        let mailParams: EmailParams = {
          toMail: user?.email,
          mailType: 'verification',
          url,
        };
        if (
          this.emailOptions?.verificationMailSubject ||
          this.emailOptions?.verificationMailBody
        ) {
          mailParams = {
            ...mailParams,
            mailSubject: this.emailOptions?.forgotPasswordSubject,
            mailBody: this.emailOptions?.forgotPasswordBody,
          };
        }
        this.sendEmail(mailParams);
      }
      this.response.created(res, {
        message: 'User registered successfully',
      });
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  async verifyEmailRoute(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;
      const payload = verifyToken(token.toString());
      const user = await this.getUser({ id: payload.userId });
      if (user) {
        this.response.success(res, {
          message: 'User verification successful!',
        });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  logoutRoute(req: Request, res: Response): void {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        this.response.unauthorized(res, { error: 'Unauthorized' });
      }
      res.cookie('token', '', { expires: new Date(0) });
      this.response.success(res, { message: 'Logout successful' });
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: 'Internal Server Error' });
    }
  }

  getRouter(): express.Router {
    return this.router;
  }
}
