## Overview

auth-ez is a package designed to handle authentication-related functionality (token based) within a Node.js application using Express. It provides routes and methods for user authentication, registration, password reset, refresh tokens and email verification. This document outlines the structure, methods, and usage of the package.

## Refresh Token Functionality
auth-ez supports refresh token-based authentication to maintain user sessions securely. A refresh token is issued alongside the access token during login, allowing users to obtain a new access token without re-authenticating. This is particularly useful for maintaining sessions in applications where the access token has a short expiration time.

Key features:

- **Automatic Refresh Token Generation**: Refresh tokens are issued when a user logs in.
- **Token Refresh Endpoint**: The package provides a route to refresh access tokens using a valid refresh token.
- **Optional Cookie Storage**: You can choose to store refresh tokens in cookies for added security, or handle them manually in the request body.

## Prerequisites

<p>Before using auth-ez, ensure the following dependencies are installed:</p>

- [NodeJS](https://nodejs.org/en)
- [Express](https://expressjs.com/)
- [Dotenv](https://github.com/motdotla/dotenv#readme)

## Installation

To use auth-ez in your project, follow these steps:

Install the required packages:

```bash
npm install auth-ez
```

Inside your .env add `JWT_SECRET_KEY` (required), `REFRESH_TOKEN_SECRET` for refresh token, `BASE_URL` and `FROM_EMAIL` for email (optional).

Based on the project import CreateMongoAuthController or CreateSqlAuthController:

```typescript
import { CreateMongoAuthController, CreateSqlAuthController } from 'auth-ez';
```

```typescript
const authController = new CreateMongoAuthController(config).getRouter();
```

> **config**: An object containing configuration options for the AuthController. Refer to the Config type for available options.

<u>You can implement your own version of controllers by importing AuthController from the package and extending it in your class. [Examples](#examples) ⬇︎</u>

#### The AuthController requires a User model which can be added inside configuration object (Config) during instantiation.

The configuration options include:

1. User: User model or schema (required).
2. routeNames: Custom names for authentication routes (optional).
3. hashPassword: Custom password hashing function (optional).
4. tokenOptions: Options for token generation (optional).
5. emailOptions: Email configuration options (optional).
6. enableLogs: Enable logging (optional).
7. enableRefreshToken: To enable refresh token functionality.
8. refreshTokenOptions: Options for refresh token (check example below).

## Email

By default, auth-ez provides support for [Resend](https://resend.com/) and [Nodemailer](https://nodemailer.com/) email API (for forgot-password and verify-email). You just have to initialize and pass one of these in `config > emailOptions` as shown in the example below. More support will be added soon.

## Routes

auth-ez provides the following authentication routes which takes body in `application/json` format:

- `POST /login-with-email`: Login with email and password - Body: `email, password`.
- `POST /login-with-username`: Login with username and password - Body: `username, password`.
- `POST /forgot-password`: Request a password reset email - Body: `email`.
- `POST /reset-password`: Reset password with a valid token - Body: `newPassword`, have to pass token as query param: `/reset-password?token=your_generated_token`.
- `POST /register`: User registration - Body: `username, email and password`.
- `POST /logout`: Logout - Pass current **Bearer token** and it should expire the token.
- `POST /verify-email`: Email verification.
- `POST /resend-verification-email`: Resend verification email - You can resend a verification email using this route, have to pass user id in req.body.
- `POST /refresh-token`: Refresh the access token using a valid refresh token - Body: { refreshToken: "your_refresh_token" }.

 > You can rename the routes or use these.

## Methods

If you want to create your own implementation instead of using default one you can import `AuthController` from the package and extend your class to it. By doing that you will be able to modify or write your own methods, which are:

```typescript
// Abstract method to be implemented by the user. Saves a new user to the data store.
saveUser(params: SaveUser): Promise<IUser>
// Abstract method to be implemented by the user. Retrieves a user from the data store.
getUser(params: GetUser): Promise<IUser>
// Abstract method to be implemented by the user. Updates user information in the data store.
updateUser(params: UpdateUser): Promise<IUser>

```

## Error Handling

auth-ez handles various errors, including missing fields, user not found, invalid credentials, and internal server errors.

## Examples

Examples can be found under [auth-ez-examples](https://www.github.com/usaidpeerzada/auth-ez-examples) repository, explained in Typescript and Javascript.

This example sets up an Express server and mounts the AuthController routes under the '/auth' path.

```typescript
import express from 'express';
import {
  CreateMongoAuthController,
  CreateSqlAuthController,
  EmailService,
} from 'auth-ez';

const app = express();
const config = {
  User, //required
  enableLogs: true, //optional
  hashPassword: Function, //optional - By default uses bcrypt and takes saltRounds = 16;
  //optional
  tokenOptions: {
    expiresIn: '2h', // defaults to 1 hr
  },
  //optional
  routeNames: {
    loginWithEmailRoute: '/test-post-requests',
    loginWithUsernameRoute: '/my-user-route',
    signupRoute: '/sign-up',
    forgotPasswordRoute,
    resetPasswordRoute,
    signupRoute,
    logoutRoute,
  },
  //optional
  emailOptions: {
    enableEmail: true,
    emailType: 'resend' || 'nodemailer',
    emailSdk: resend || nodemailer,
    forgotPasswordSubject: '',
    forgotPasswordBody: '',
    verificationMailSubject: 'Sending custom subject from config', // default: Verify your email
    verificationMailBody: `here is the body`, // default: sends base_url?token=your_token in email;
  },
  enableRefreshToken: false, // to enable use of refresh token functionality
  refreshTokenOptions: {
    useCookie: true, // Store refresh token in cookies (optional)
    cookieOptions: { httpOnly: true, secure: true, sameSite: 'strict' }, // Customize cookie settings (optional)
  },
};

const authController = new AuthController(config).getRouter();

app.use('/auth', authController); // route name can be /anything does not necessarily have to be /auth

app.get('/auth/profile', (req, res) => {
  res.send('Protected route!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Tests

Chai and Mocha has been used for testing purpose, here's how you can test this package:

1. Import express app context and User model from your local express app into the test files.
2. Run `npm run test` to test.

## Conclusion

auth-ez simplifies the implementation of authentication features in your Node.js application. Customize the configuration and implement the abstract methods to integrate with your specific data store and user model.
