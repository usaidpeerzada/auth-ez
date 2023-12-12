"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const utils_1 = require("./utils");
const emailService_1 = tslib_1.__importDefault(require("./emails/emailService"));
const resendEmailService_1 = tslib_1.__importDefault(require("./emails/resendEmailService"));
const constants_1 = require("./constants");
const nodemailerEmailService_1 = tslib_1.__importDefault(require("./emails/nodemailerEmailService"));
const utils_2 = require("./utils");
const responseController_1 = tslib_1.__importDefault(require("./responseController"));
class AuthController {
    config;
    router;
    emailOptions;
    response;
    User;
    constructor(config) {
        this.config = config;
        const routes = {
            emailLoginRoute: config.routeNames?.loginWithEmailRoute || '/login-with-email',
            usernameLoginRoute: config.routeNames?.loginWithUsernameRoute || '/login-with-username',
            forgotPasswordRoute: config.routeNames?.forgotPasswordRoute || '/forgot-password',
            resetPasswordRoute: config.routeNames?.resetPasswordRoute || '/reset-password',
            signupRoute: config.routeNames?.signupRoute || '/register',
            logoutRoute: config.routeNames?.logoutRoute || '/logout',
        };
        this.router = express_1.default.Router();
        this.router.use(express_1.default.json());
        this.router.use((0, utils_2.protectedRoutes)(routes));
        this.User = config.User;
        this.emailOptions = this.config.emailOptions;
        this.response = new responseController_1.default();
        this.router.post(`${routes.emailLoginRoute}`, this.loginWithEmail.bind(this));
        this.router.post(`${routes.usernameLoginRoute}`, this.loginWithUsername.bind(this));
        this.router.post(`${routes.forgotPasswordRoute}`, this.forgotPasswordRoute.bind(this));
        this.router.post(`${routes.resetPasswordRoute}`, this.resetPasswordRoute.bind(this));
        this.router.post(`${routes.signupRoute}`, this.signUpRoute.bind(this));
        this.router.post(`${routes.logoutRoute}`, this.logoutRoute.bind(this));
    }
    async sendEmail(params) {
        if (this.emailOptions &&
            Object.keys(this.emailOptions).length &&
            this.emailOptions.emailType !== '' &&
            this.emailOptions.emailSdk) {
            let emailService;
            if (this.emailOptions?.emailType === constants_1.emailTypes.NODEMAILER) {
                const nodemailerConfig = new nodemailerEmailService_1.default(this.emailOptions?.emailSdk);
                emailService = new emailService_1.default({ emailClient: nodemailerConfig });
            }
            else if (this.emailOptions?.emailType === constants_1.emailTypes.RESEND) {
                const resendConfig = new resendEmailService_1.default(this.emailOptions?.emailSdk);
                emailService = new emailService_1.default({ emailClient: resendConfig });
            }
            else {
                emailService = this.emailOptions.emailService;
            }
            emailService.sendEmail(params);
        }
    }
    hashPassword(password, options) {
        let hashedPassword;
        if (this.config.hashPassword) {
            hashedPassword = this.config.hashPassword(password, options);
        }
        else {
            hashedPassword = (0, utils_1.hashPassword)(password);
        }
        return hashedPassword;
    }
    async comparePassword(plainPassword, hashedPassword) {
        const compareFunction = this.config.comparePassword ?? utils_1.comparePasswords;
        const comparePassword = await compareFunction(plainPassword, hashedPassword);
        return Boolean(comparePassword);
    }
    generateToken(payload, userOptions) {
        return (0, utils_1.generateToken)(payload, userOptions);
    }
    async loginWithEmail(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return this.response.clientError(res, {
                    error: 'All fields are required!',
                });
            }
            const user = await this.getUser({ email });
            if (!user) {
                return this.response.notFound(res, { error: 'User not found!' });
            }
            const comparePasswordWithHash = await this.comparePassword(password, user?.password);
            if (user && comparePasswordWithHash) {
                const token = this.generateToken({ userId: user._id || user.id }, this.config?.tokenOptions);
                return this.response.success(res, {
                    message: 'Login successful',
                    token,
                });
            }
            else {
                return this.response.unauthorized(res, {
                    error: 'Invalid credentials',
                });
            }
        }
        catch (err) {
            this.config.enableLogs &&
                console.info(`Error in route: ${req.path}: `, err);
            return this.response.error(res, { error: 'Internal Server Error' });
        }
    }
    async loginWithUsername(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return this.response.clientError(res, {
                    error: 'All fields are required!',
                });
            }
            const user = await this.getUser({ username });
            if (!user) {
                return this.response.notFound(res, { error: 'User not found!' });
            }
            const comparePasswordWithHash = await this.comparePassword(password, user?.password);
            if (user && comparePasswordWithHash) {
                const token = (0, utils_1.generateToken)({ userId: user._id }, this.config.tokenOptions);
                return this.response.success(res, {
                    message: 'Login successful',
                    token,
                });
            }
            else {
                return this.response.unauthorized(res, {
                    error: 'Invalid credentials',
                });
            }
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            return this.response.error(res, { error: 'Internal Server Error' });
        }
    }
    async forgotPasswordRoute(req, res) {
        try {
            const { email } = req.body;
            const user = await this.getUser({ email });
            if (user) {
                const resetToken = this.generateToken({ userId: user._id || user.id }, this.config?.tokenOptions);
                const url = `${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`;
                let mailParams = {
                    toMail: user?.email,
                    mailType: 'reset',
                    url,
                };
                if (this.emailOptions?.forgotPasswordSubject ||
                    this.emailOptions?.forgotPasswordBody) {
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
            }
            else {
                return this.response.notFound(res, { error: 'User not found' });
            }
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            return this.response.error(res, { error: 'Internal Server Error' });
        }
    }
    async resetPasswordRoute(req, res) {
        try {
            const { newPassword } = req.body;
            const { token } = req.query;
            const payload = (0, utils_1.verifyToken)(token.toString());
            const user = await this.getUser({ id: payload.userId });
            if (user) {
                const hashedPassword = await this.hashPassword(newPassword);
                await this.updateUser({
                    id: user?.id || user?._id,
                    password: hashedPassword,
                });
                this.response.success(res, { message: 'Password reset successful' });
            }
            else {
                this.response.notFound(res, { error: 'User not found' });
            }
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            this.response.error(res, { error: 'Internal Server Error' });
        }
    }
    async signUpRoute(req, res) {
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
            const hashedPassword = await this.hashPassword(password);
            const user = await this.saveUser({
                username,
                email,
                password: hashedPassword,
            });
            if (this.config?.emailOptions?.enableEmail) {
                const verificationToken = (0, utils_1.generateToken)({ userId: user._id || user.id }, this.config?.tokenOptions);
                const url = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
                let mailParams = {
                    toMail: user?.email,
                    mailType: 'verification',
                    url,
                };
                if (this.emailOptions?.verificationMailSubject ||
                    this.emailOptions?.verificationMailBody) {
                    mailParams = {
                        ...mailParams,
                        mailSubject: this.emailOptions?.verificationMailSubject,
                        mailBody: this.emailOptions?.verificationMailBody,
                    };
                }
                this.sendEmail(mailParams);
            }
            this.response.created(res, {
                message: 'User registered successfully',
            });
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            this.response.error(res, { error: 'Internal Server Error' });
        }
    }
    logoutRoute(req, res) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                this.response.unauthorized(res, { error: 'Unauthorized' });
            }
            res.cookie('token', '', { expires: new Date(0) });
            this.response.success(res, { message: 'Logout successful' });
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            this.response.error(res, { error: 'Internal Server Error' });
        }
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthController = AuthController;
