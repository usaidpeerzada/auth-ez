"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const emailService_1 = __importDefault(require("./emails/emailService"));
const resendEmailService_1 = __importDefault(require("./emails/resendEmailService"));
const constants_1 = require("./constants");
const nodemailerEmailService_1 = __importDefault(require("./emails/nodemailerEmailService"));
const utils_2 = require("./utils");
const responseController_1 = __importDefault(require("./responseController"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
class AuthController {
    config;
    router;
    emailOptions;
    response;
    User;
    constructor(config) {
        this.config = config;
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: config?.rateLimitOptions?.windowMs || 15 * 60 * 1000, // 15 minutes
            max: config?.rateLimitOptions?.max || 100,
            message: {
                message: constants_1.RATE_LIMIT_IP_ERR,
            },
        });
        const routes = {
            emailLoginRoute: config.routeNames?.loginWithEmailRoute || constants_1.LOGIN_WITH_EMAIL,
            usernameLoginRoute: config.routeNames?.loginWithUsernameRoute || constants_1.LOGIN_WITH_USERNAME,
            forgotPasswordRoute: config.routeNames?.forgotPasswordRoute || constants_1.FORGOT_PASSWORD,
            resetPasswordRoute: config.routeNames?.resetPasswordRoute || constants_1.RESET_PASSWORD,
            signupRoute: config.routeNames?.signupRoute || constants_1.REGISTER,
            logoutRoute: config.routeNames?.logoutRoute || constants_1.LOGOUT,
            verifyEmail: config.routeNames?.verifyEmail || constants_1.VERIFY_EMAIL,
            refreshToken: config.routeNames?.refreshToken || constants_1.REFRESH_TOKEN_ROUTE,
        };
        const resendVerificationRoute = config.routeNames?.resendVerificationEmail || constants_1.RESEND_VERIFICATION_EMAIL;
        this.router = express_1.default.Router();
        this.router.use(express_1.default.json());
        this.router.use(limiter);
        this.router.use((0, utils_2.protectedRoutes)(routes, config.User));
        this.User = config.User;
        this.emailOptions = this.config.emailOptions;
        this.response = new responseController_1.default();
        this.router.post(`${routes.emailLoginRoute}`, this.loginWithEmail.bind(this));
        this.router.post(`${routes.usernameLoginRoute}`, this.loginWithUsername.bind(this));
        this.router.post(`${routes.forgotPasswordRoute}`, this.forgotPasswordRoute.bind(this));
        this.router.post(`${routes.resetPasswordRoute}`, this.resetPasswordRoute.bind(this));
        this.router.post(`${routes.signupRoute}`, this.signUpRoute.bind(this));
        this.router.post(`${routes.logoutRoute}`, this.logoutRoute.bind(this));
        this.router.get(`${routes.verifyEmail}`, this.verifyEmail.bind(this));
        this.router.post(`${resendVerificationRoute}`, this.resendVerificationEmail.bind(this));
        this.router.post('/refresh-token', this.refreshToken.bind(this));
    }
    async sendEmail(params) {
        if (this.emailOptions && Object.keys(this.emailOptions).length) {
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
    async loginWithEmail(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return this.response.clientError(res, {
                    error: constants_1.REQUIRED_FIELDS,
                });
            }
            const user = await this.getUser({ email });
            if (!user) {
                return this.response.notFound(res, { error: constants_1.USER_NOT_FOUND });
            }
            const comparePasswordWithHash = await this.comparePassword(password, user?.password);
            if (user.lockUntil && user.lockUntil > Date.now()) {
                return this.response.unauthorized(res, {
                    error: constants_1.RATE_LIMIT_ERR,
                });
            }
            if (user && comparePasswordWithHash) {
                const token = (0, utils_1.generateToken)({ userId: user._id || user.id }, this.config?.tokenOptions);
                const payload = {
                    message: constants_1.LOGIN_SUCCESSFUL,
                    token,
                    userId: user._id || user.id,
                };
                if (this.config.enableRefreshToken) {
                    const refreshToken = (0, utils_1.generateRefreshToken)(user._id || user.id);
                    await this.updateUser({
                        id: user._id || user.id,
                        refreshToken,
                    });
                    if (!(0, utils_1.isNullOrEmpty)(this.config.refreshTokenOptions) &&
                        this.config.refreshTokenOptions.useCookie) {
                        const cookieOptions = !(0, utils_1.isNullOrEmpty)(this.config.refreshTokenOptions.cookieOptions)
                            ? this.config.refreshTokenOptions.cookieOptions
                            : {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict',
                            };
                        res.cookie('refreshToken', refreshToken, cookieOptions);
                    }
                    else {
                        payload.refreshToken = refreshToken;
                    }
                }
                return this.response.success(res, payload);
            }
            else {
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
                    error: constants_1.INVALID_CREDENTIALS,
                });
            }
        }
        catch (err) {
            this.config.enableLogs &&
                console.info(`Error in route: ${req.path}: `, err);
            return this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    async loginWithUsername(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return this.response.clientError(res, {
                    error: constants_1.REQUIRED_FIELDS,
                });
            }
            const user = await this.getUser({ username });
            if (!user) {
                return this.response.notFound(res, { error: constants_1.USER_NOT_FOUND });
            }
            const comparePasswordWithHash = await this.comparePassword(password, user?.password);
            if (user && comparePasswordWithHash) {
                const token = (0, utils_1.generateToken)({ userId: user._id || user.id }, this.config.tokenOptions);
                const payload = {
                    message: constants_1.LOGIN_SUCCESSFUL,
                    token,
                    userId: user._id || user.id,
                };
                if (this.config.enableRefreshToken) {
                    const refreshToken = (0, utils_1.generateRefreshToken)(user._id || user.id);
                    await this.updateUser({
                        id: user._id || user.id,
                        refreshToken,
                    });
                    if (!(0, utils_1.isNullOrEmpty)(this.config.refreshTokenOptions) &&
                        this.config.refreshTokenOptions.useCookie) {
                        const cookieOptions = !(0, utils_1.isNullOrEmpty)(this.config.refreshTokenOptions.cookieOptions)
                            ? this.config.refreshTokenOptions.cookieOptions
                            : {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict',
                            };
                        res.cookie('refreshToken', refreshToken, cookieOptions);
                    }
                    else {
                        payload.refreshToken = refreshToken;
                    }
                }
                return this.response.success(res, payload);
            }
            else {
                return this.response.unauthorized(res, {
                    error: constants_1.INVALID_CREDENTIALS,
                });
            }
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            return this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    async forgotPasswordRoute(req, res) {
        try {
            const { email } = req.body;
            const user = await this.getUser({ email });
            if (user) {
                const resetToken = (0, utils_1.generateToken)({ userId: user._id || user.id }, this.config?.tokenOptions);
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
                return this.response.notFound(res, { error: constants_1.USER_NOT_FOUND });
            }
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            return this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    async resetPasswordRoute(req, res) {
        try {
            const { newPassword } = req.body;
            const { token } = req.query;
            const payload = (0, utils_1.verifyToken)(token.toString());
            if (!(0, utils_1.validatePassword)(newPassword)) {
                this.response.clientError(res, {
                    error: constants_1.PASSWORD_VAL_ERR,
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
                this.response.success(res, { message: constants_1.PASSWORD_RESET_SUCCESSFUL });
            }
            else {
                this.response.notFound(res, { error: constants_1.USER_NOT_FOUND });
            }
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    async signUpRoute(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!email || !username || !password) {
                this.response.clientError(res, { error: constants_1.REQUIRED_FIELDS });
                return;
            }
            if (!(0, utils_1.validatePassword)(password)) {
                this.response.clientError(res, {
                    error: constants_1.PASSWORD_VAL_ERR,
                });
                return;
            }
            const existingUser = await this.getUser({
                email,
                username,
            });
            if (existingUser) {
                this.response.clientError(res, {
                    error: constants_1.USERNAME_ALREADY_EXISTS,
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
                const url = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
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
                message: constants_1.USER_REGISTERED_SUCCESSFULLY,
            });
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    logoutRoute(req, res) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                this.response.unauthorized(res, { error: constants_1.UNAUTHORIZED });
            }
            res.cookie('token', '', { expires: new Date(0) });
            this.response.success(res, { message: constants_1.LOGOUT_SUCCESSFUL });
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    async verifyEmail(req, res) {
        const token = req.query.token;
        if (!token) {
            this.response.unauthorized(res, { error: constants_1.UNAUTHORIZED });
        }
        try {
            const decodedToken = (0, utils_1.verifyToken)(token);
            const userId = decodedToken.userId;
            await (0, utils_1.markEmailAsVerified)(userId, this.User);
            this.response.success(res, {
                message: 'Email verified successfully',
                verified: true,
            });
        }
        catch (error) {
            console.error('Error verifying email:', error.message);
            this.response.clientError(res, { error: 'Invalid or expired token' });
        }
    }
    async resendVerificationEmail(req, res) {
        try {
            const userId = req.body.id;
            const user = await this.getUser({ id: userId });
            const token = (0, utils_1.generateToken)({ userId: userId, email: user.email }, this.config?.tokenOptions);
            const url = `${process.env.BASE_URL}/verify-email?token=${token}`;
            let mailParams = {
                toMail: user.email,
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
            res.status(200).send('Verification email resent successfully');
        }
        catch (error) {
            console.error('Error resending verification email:', error.message);
            res.status(500).send('Internal server error');
        }
    }
    async refreshToken(req, res) {
        try {
            const token = req.body.refreshToken;
            if (!token) {
                return this.response.unauthorized(res, { error: constants_1.UNAUTHORIZED });
            }
            const decoded = (0, utils_1.verifyRefreshToken)(token);
            if (!decoded) {
                return this.response.unauthorized(res, { error: 'Invalid token' });
            }
            const user = await this.getUser({ id: decoded.userId });
            if (!user || user.refreshToken !== token) {
                return this.response.unauthorized(res, { error: constants_1.UNAUTHORIZED });
            }
            const accessToken = (0, utils_1.generateToken)({ userId: user._id || user.id }, this.config?.tokenOptions);
            const newRefreshToken = (0, utils_1.generateRefreshToken)(user._id || user.id);
            await this.updateUser({
                id: user._id || user.id,
                refreshToken: newRefreshToken,
            });
            const payload = {
                token: accessToken,
                userId: user._id || user.id,
            };
            if (!(0, utils_1.isNullOrEmpty)(this.config.refreshTokenOptions) &&
                this.config.refreshTokenOptions.useCookie) {
                const cookieOptions = !(0, utils_1.isNullOrEmpty)(this.config.refreshTokenOptions.cookieOptions)
                    ? this.config.refreshTokenOptions.cookieOptions
                    : {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                    };
                res.cookie('refreshToken', newRefreshToken, cookieOptions);
            }
            else {
                payload.refreshToken = newRefreshToken;
            }
            return this.response.success(res, payload);
        }
        catch (error) {
            this.config.enableLogs && console.info(`Error in ${req.path}: `, error);
            return this.response.error(res, { error: constants_1.INTERNAL_SERVER_ERROR });
        }
    }
    getRouter() {
        return this.router;
    }
}
exports.default = AuthController;
