import express, { Request, Response, Router } from 'express';
import {
  comparePasswords,
  generateRefreshToken,
  generateToken,
  hashPassword,
  isNullOrEmpty,
  markEmailAsVerified,
  validatePassword,
  verifyRefreshToken,
  verifyToken,
} from './utils';
import {
  Config,
  EmailOptions,
  EmailParams,
  GetUser,
  SaveUser,
  UpdateUser,
  IUser,
  SuccessResponse,
} from './types';
import EmailService from './emails/emailService';
import ResendEmailService from './emails/resendEmailService';
import {
  LOGIN_WITH_EMAIL,
  LOGIN_WITH_USERNAME,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  REGISTER,
  LOGOUT,
  emailTypes,
  REQUIRED_FIELDS,
  USER_NOT_FOUND,
  LOGIN_SUCCESSFUL,
  INVALID_CREDENTIALS,
  INTERNAL_SERVER_ERROR,
  LOGOUT_SUCCESSFUL,
  UNAUTHORIZED,
  USER_REGISTERED_SUCCESSFULLY,
  USERNAME_ALREADY_EXISTS,
  PASSWORD_RESET_SUCCESSFUL,
  VERIFY_EMAIL,
  RESEND_VERIFICATION_EMAIL,
  REFRESH_TOKEN_ROUTE,
  PASSWORD_VAL_ERR,
  RATE_LIMIT_ERR,
  RATE_LIMIT_IP_ERR,
} from './constants';
import NodemailerEmailService from './emails/nodemailerEmailService';
import { protectedRoutes } from './utils';
import ResponseController from './responseController';
import rateLimit from 'express-rate-limit';

export default abstract class AuthController {
  private readonly config: Config;
  private readonly router: Router;
  private readonly emailOptions: EmailOptions;
  private readonly response: ResponseController;
  readonly User: any;

  constructor(config: Config) {
    this.config = config;
    const limiter = rateLimit({
      windowMs: config?.rateLimitOptions?.windowMs || 15 * 60 * 1000, // 15 minutes
      max: config?.rateLimitOptions?.max || 10,
      message: {
        message: RATE_LIMIT_IP_ERR,
      },
    });
    const routes = {
      emailLoginRoute:
        config.routeNames?.loginWithEmailRoute || LOGIN_WITH_EMAIL,
      usernameLoginRoute:
        config.routeNames?.loginWithUsernameRoute || LOGIN_WITH_USERNAME,
      forgotPasswordRoute:
        config.routeNames?.forgotPasswordRoute || FORGOT_PASSWORD,
      resetPasswordRoute:
        config.routeNames?.resetPasswordRoute || RESET_PASSWORD,
      signupRoute: config.routeNames?.signupRoute || REGISTER,
      logoutRoute: config.routeNames?.logoutRoute || LOGOUT,
      verifyEmail: config.routeNames?.verifyEmail || VERIFY_EMAIL,
      refreshToken: config.routeNames?.refreshToken || REFRESH_TOKEN_ROUTE,
    };
    const resendVerificationRoute =
      config.routeNames?.resendVerificationEmail || RESEND_VERIFICATION_EMAIL;
    this.router = express.Router();
    this.router.use(express.json());
    this.router.use(limiter);
    this.router.use(protectedRoutes(routes, config.User));
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
    this.router.get(`${routes.verifyEmail}`, this.verifyEmail.bind(this));
    this.router.post(
      `${resendVerificationRoute}`,
      this.resendVerificationEmail.bind(this),
    );
    this.router.post('/refresh-token', this.refreshToken.bind(this));
  }

  abstract saveUser(params: SaveUser): Promise<IUser>;
  abstract getUser(params: GetUser): Promise<IUser>;
  abstract updateUser(params: UpdateUser): Promise<IUser>;

  private async sendEmail(params: object): Promise<void | boolean> {
    if (this.emailOptions && Object.keys(this.emailOptions).length) {
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

  hashPassword(password: string, options?: object): Promise<string> {
    let hashedPassword: Promise<string>;
    if (this.config.hashPassword) {
      hashedPassword = this.config.hashPassword(password, options);
    } else {
      hashedPassword = hashPassword(password);
    }
    return hashedPassword;
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const compareFunction = this.config.comparePassword ?? comparePasswords;
    const comparePassword = await compareFunction(
      plainPassword,
      hashedPassword,
    );
    return Boolean(comparePassword);
  }

  async loginWithEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return this.response.clientError(res, {
          error: REQUIRED_FIELDS,
        });
      }
      const user = await this.getUser({ email });
      if (!user) {
        return this.response.notFound(res, { error: USER_NOT_FOUND });
      }
      const comparePasswordWithHash = await this.comparePassword(
        password,
        user?.password,
      );
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return this.response.unauthorized(res, {
          error: RATE_LIMIT_ERR,
        });
      }
      if (user && comparePasswordWithHash) {
        const token = generateToken(
          { userId: user._id || user.id },
          this.config?.tokenOptions,
        );
        const payload: SuccessResponse = {
          message: LOGIN_SUCCESSFUL,
          token,
          userId: user._id || user.id,
        };
        if (this.config.enableRefreshToken) {
          const refreshToken = generateRefreshToken(user._id || user.id);
          await this.updateUser({
            id: user._id || user.id,
            refreshToken,
          });
          if (
            !isNullOrEmpty(this.config.refreshTokenOptions) &&
            this.config.refreshTokenOptions.useCookie
          ) {
            const cookieOptions = !isNullOrEmpty(
              this.config.refreshTokenOptions.cookieOptions,
            )
              ? this.config.refreshTokenOptions.cookieOptions
              : {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                };
            res.cookie('refreshToken', refreshToken, cookieOptions);
          } else {
            payload.refreshToken = refreshToken;
          }
        }
        return this.response.success(res, payload);
      } else {
        await this.updateUser({
          id: user._id || user.id,
          loginAttempts: user.loginAttempts + 1,
        });

        if (user.loginAttempts >= 5) {
          await this.updateUser({
            id: user._id || user.id,
            lockUntil: Date.now() + 60 * 60 * 1000, // 1 hour
          });
        }
        return this.response.unauthorized(res, {
          error: INVALID_CREDENTIALS,
        });
      }
    } catch (err) {
      this.config.enableLogs &&
        console.info(`Error in route: ${req.path}: `, err);
      return this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  async loginWithUsername(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return this.response.clientError(res, {
          error: REQUIRED_FIELDS,
        });
      }
      const user = await this.getUser({ username });
      if (!user) {
        return this.response.notFound(res, { error: USER_NOT_FOUND });
      }
      const comparePasswordWithHash = await this.comparePassword(
        password,
        user?.password,
      );
      if (user && comparePasswordWithHash) {
        const token = generateToken(
          { userId: user._id || user.id },
          this.config.tokenOptions,
        );
        const payload: SuccessResponse = {
          message: LOGIN_SUCCESSFUL,
          token,
          userId: user._id || user.id,
        };
        if (this.config.enableRefreshToken) {
          const refreshToken = generateRefreshToken(user._id || user.id);
          await this.updateUser({
            id: user._id || user.id,
            refreshToken,
          });
          if (
            !isNullOrEmpty(this.config.refreshTokenOptions) &&
            this.config.refreshTokenOptions.useCookie
          ) {
            const cookieOptions = !isNullOrEmpty(
              this.config.refreshTokenOptions.cookieOptions,
            )
              ? this.config.refreshTokenOptions.cookieOptions
              : {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                };
            res.cookie('refreshToken', refreshToken, cookieOptions);
          } else {
            payload.refreshToken = refreshToken;
          }
        }
        return this.response.success(res, payload);
      } else {
        return this.response.unauthorized(res, {
          error: INVALID_CREDENTIALS,
        });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      return this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  async forgotPasswordRoute(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const user = await this.getUser({ email });
      if (user) {
        const resetToken = generateToken(
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
        return this.response.success(res, {
          message: 'Password reset email sent',
        });
      } else {
        return this.response.notFound(res, { error: USER_NOT_FOUND });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      return this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  async resetPasswordRoute(req: Request, res: Response): Promise<void> {
    try {
      const { newPassword } = req.body;
      const { token } = req.query;
      const payload = verifyToken(token.toString());
      if (!validatePassword(newPassword)) {
        this.response.clientError(res, {
          error: PASSWORD_VAL_ERR,
        });
        return;
      }
      const user = await this.getUser({ id: payload.userId });
      if (user) {
        const hashedPassword = await this.hashPassword(newPassword);
        await this.updateUser({
          id: user?.id || user?._id,
          password: hashedPassword,
        });
        this.response.success(res, { message: PASSWORD_RESET_SUCCESSFUL });
      } else {
        this.response.notFound(res, { error: USER_NOT_FOUND });
      }
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  async signUpRoute(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      if (!email || !username || !password) {
        this.response.clientError(res, { error: REQUIRED_FIELDS });
        return;
      }
      if (!validatePassword(password)) {
        this.response.clientError(res, {
          error: PASSWORD_VAL_ERR,
        });
        return;
      }
      const existingUser = await this.getUser({
        email,
        username,
      });
      if (existingUser) {
        this.response.clientError(res, {
          error: USERNAME_ALREADY_EXISTS,
        });
        return;
      }
      const hashedPassword = await this.hashPassword(password);
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
        const url = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
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
            mailSubject: this.emailOptions?.verificationMailSubject,
            mailBody: this.emailOptions?.verificationMailBody,
          };
        }
        this.sendEmail(mailParams);
      }
      this.response.created(res, {
        message: USER_REGISTERED_SUCCESSFULLY,
      });
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  logoutRoute(req: Request, res: Response): void {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        this.response.unauthorized(res, { error: UNAUTHORIZED });
      }
      res.cookie('token', '', { expires: new Date(0) });
      this.response.success(res, { message: LOGOUT_SUCCESSFUL });
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const token = req.query.token as string;
    if (!token) {
      this.response.unauthorized(res, { error: UNAUTHORIZED });
    }
    try {
      const decodedToken = verifyToken(token);
      const userId = decodedToken.userId;
      await markEmailAsVerified(userId, this.User);
      this.response.success(res, {
        message: 'Email verified successfully',
        verified: true,
      });
    } catch (error) {
      console.error('Error verifying email:', error.message);
      this.response.clientError(res, { error: 'Invalid or expired token' });
    }
  }

  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.id;
      const user = await this.getUser({ id: userId });
      const token = generateToken(
        { userId: userId, email: user.email },
        this.config?.tokenOptions,
      );
      const url = `${process.env.BASE_URL}/verify-email?token=${token}`;
      let mailParams: EmailParams = {
        toMail: user.email,
        mailType: 'verification',
        url,
      };
      if (
        this.emailOptions?.verificationMailSubject ||
        this.emailOptions?.verificationMailBody
      ) {
        mailParams = {
          ...mailParams,
          mailSubject: this.emailOptions?.verificationMailSubject,
          mailBody: this.emailOptions?.verificationMailBody,
        };
      }
      this.sendEmail(mailParams);
      res.status(200).send('Verification email resent successfully');
    } catch (error) {
      console.error('Error resending verification email:', error.message);
      res.status(500).send('Internal server error');
    }
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.body.refreshToken;
      if (!token) {
        return this.response.unauthorized(res, { error: UNAUTHORIZED });
      }
      const decoded = verifyRefreshToken(token);
      if (!decoded) {
        return this.response.unauthorized(res, { error: 'Invalid token' });
      }
      const user = await this.getUser({ id: decoded.userId });
      if (!user || user.refreshToken !== token) {
        return this.response.unauthorized(res, { error: UNAUTHORIZED });
      }
      const accessToken = generateToken(
        { userId: user._id || user.id },
        this.config?.tokenOptions,
      );
      const newRefreshToken = generateRefreshToken(user._id || user.id);
      await this.updateUser({
        id: user._id || user.id,
        refreshToken: newRefreshToken,
      });
      const payload: SuccessResponse = {
        token: accessToken,
        userId: user._id || user.id,
      };
      if (
        !isNullOrEmpty(this.config.refreshTokenOptions) &&
        this.config.refreshTokenOptions.useCookie
      ) {
        const cookieOptions = !isNullOrEmpty(
          this.config.refreshTokenOptions.cookieOptions,
        )
          ? this.config.refreshTokenOptions.cookieOptions
          : {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            };
        res.cookie('refreshToken', newRefreshToken, cookieOptions);
      } else {
        payload.refreshToken = newRefreshToken;
      }
      return this.response.success(res, payload);
    } catch (error) {
      this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
      return this.response.error(res, { error: INTERNAL_SERVER_ERROR });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
