"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_RESET_SUCCESSFUL = exports.USERNAME_ALREADY_EXISTS = exports.USER_REGISTERED_SUCCESSFULLY = exports.UNAUTHORIZED = exports.LOGOUT_SUCCESSFUL = exports.INTERNAL_SERVER_ERROR = exports.INVALID_CREDENTIALS = exports.LOGIN_SUCCESSFUL = exports.USER_NOT_FOUND = exports.REQUIRED_FIELDS = exports.RESEND_VERIFICATION_EMAIL = exports.VERIFY_EMAIL = exports.LOGOUT = exports.REGISTER = exports.RESET_PASSWORD = exports.FORGOT_PASSWORD = exports.LOGIN_WITH_USERNAME = exports.LOGIN_WITH_EMAIL = exports.emailTypes = void 0;
exports.emailTypes = {
    NODEMAILER: 'nodemailer',
    RESEND: 'resend',
};
exports.LOGIN_WITH_EMAIL = '/login-with-email';
exports.LOGIN_WITH_USERNAME = '/login-with-username';
exports.FORGOT_PASSWORD = '/forgot-password';
exports.RESET_PASSWORD = '/reset-password';
exports.REGISTER = '/register';
exports.LOGOUT = '/logout';
exports.VERIFY_EMAIL = '/verify-email';
exports.RESEND_VERIFICATION_EMAIL = '/resend-verification-email';
exports.REQUIRED_FIELDS = 'All fields are required!';
exports.USER_NOT_FOUND = 'User not found!';
exports.LOGIN_SUCCESSFUL = 'Login successful';
exports.INVALID_CREDENTIALS = 'Invalid credentials';
exports.INTERNAL_SERVER_ERROR = 'Internal Server Error';
exports.LOGOUT_SUCCESSFUL = 'Logout successful';
exports.UNAUTHORIZED = 'Unauthorized';
exports.USER_REGISTERED_SUCCESSFULLY = 'User registered successfully';
exports.USERNAME_ALREADY_EXISTS = 'Username or email already exists';
exports.PASSWORD_RESET_SUCCESSFUL = 'Password reset successful';
