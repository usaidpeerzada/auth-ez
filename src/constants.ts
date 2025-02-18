export const emailTypes = {
  NODEMAILER: 'nodemailer',
  RESEND: 'resend',
};

export const LOGIN_WITH_EMAIL = '/login-with-email';
export const LOGIN_WITH_USERNAME = '/login-with-username';
export const FORGOT_PASSWORD = '/forgot-password';
export const RESET_PASSWORD = '/reset-password';
export const REGISTER = '/register';
export const LOGOUT = '/logout';
export const VERIFY_EMAIL = '/verify-email';
export const RESEND_VERIFICATION_EMAIL = '/resend-verification-email';
export const REFRESH_TOKEN_ROUTE = '/refresh-token';

export const REQUIRED_FIELDS = 'All fields are required!';
export const USER_NOT_FOUND = 'User not found!';
export const LOGIN_SUCCESSFUL = 'Login successful';
export const INVALID_CREDENTIALS = 'Invalid credentials';
export const INTERNAL_SERVER_ERROR = 'Internal Server Error';
export const LOGOUT_SUCCESSFUL = 'Logout successful';
export const UNAUTHORIZED = 'Unauthorized';
export const USER_REGISTERED_SUCCESSFULLY = 'User registered successfully';
export const USERNAME_ALREADY_EXISTS = 'Username or email already exists';
export const PASSWORD_RESET_SUCCESSFUL = 'Password reset successful';
export const PASSWORD_VAL_ERR =
  'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
export const RATE_LIMIT_ERR = 'Account is temporarily locked. Try again later';
export const RATE_LIMIT_IP_ERR =
  'Too many requests from this IP, please try again later';
