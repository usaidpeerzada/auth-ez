## Overview

 auth-ez is a package designed to handle authentication-related functionality (token based) within a Node.js application using Express. It provides routes and methods for user authentication, registration, password reset, and email verification. This document outlines the structure, methods, and usage of the package.

> This is the initial phase of auth-ez package, if you find any bugs or have any suggestions please feel free to contact me on my: [email](mailto:usaid@usaid.dev) or create an issue on GitHub repository [auth-ez](https://www.github.com/usaidpeerzada/auth-ez). Currently mongoose (MongoDB) and Sequelize (SQL) are supported. Prisma support will be added soon.

## Prerequisites

<p>Before using auth-ez, ensure the following dependencies are installed:</p>

- Node.js
- TypeScript
- Express

## Installation

To use auth-ez in your project, follow these steps:

Install the required packages:

```bash
npm install auth-ez
```
Inside your .env add ```AUTH_EZ_JWT_SECRET_KEY``` (required), ```BASE_URL```  and ```FROM_EMAIL``` for email. (optional).

Based on the project import CreateMongoAuthController or CreateSqlAuthController:

```typescript
import { CreateMongoAuthContrller, CreateSqlAuthController } from 'auth-ez';
```

```typescript
const authController = new CreateMongoAuthController(config).getRouter();
```

> **config**: An object containing configuration options for the AuthController. Refer to the Config type for available options.
> Configuration

> <u>You can implement your own version controllers by importing AuthController from the package and extending it in your class.(Example will be added soon)</u>
#### The AuthController requires a User model which can be added inside configuration object (Config) during instantiation. The configuration options include:

1. User: User model or schema (required).
2. routeNames: Custom names for authentication routes (optional).
3. hashPassword: Custom password hashing function (optional).
4. comparePassword: Custom password comparison function (optional).
5. tokenOptions: Options for token generation (optional).
6. emailOptions: Email configuration options (optional).
7. enableLogs: Enable logging (optional).

## Email

By default, auth-ez provides support for [Resend](https://resend.com/) email API (for forgot-password and verify-email). More support will be added soon. (nodemailer is under testing)

## Routes

auth-ez provides the following authentication routes which takes body in `application/json` format:

- `POST /login-with-email`: Login with email and password - Body: `email, password`.
- `POST /login-with-username`: Login with username and password - Body: `username, password`.
- `POST /forgot-password`: Request a password reset email - Body: `email`.
- `POST /reset-password`: Reset password with a valid token - Body: `newPassword`, have to pass token as query param: `/reset-password?token=your_generated_token`.
- `POST /register`: User registration - Body: `username, email and password`.
- `POST /logout`: Logout - Pass current **Bearer token** and it will expire the token.
 > You can rename the routes or use these.

## Methods

```typescript
// Hashes the provided password using the configured hashing function.
hashPassword(password: string, options: object): string
// Abstract method to be implemented by the user. Saves a new user to the data store.
saveUser(params: SaveUser): Promise<IUser>
// Abstract method to be implemented by the user. Retrieves a user from the data store.
getUser(params: GetUser): Promise<IUser>
// Abstract method to be implemented by the user. Updates user information in the data store.
updateUser(params: UpdateUser): Promise<IUser>
// Compares the provided plain password with the hashed password using the configured comparison function.
comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>

```

## Error Handling

auth-ez handles various errors, including missing fields, user not found, invalid credentials, and internal server errors.

---

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
  hashPassword: Function, //optional
  //optional
  tokenOptions: {
    expiresIn: '2h',
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
    verificationMailSubject: 'Sending custom subject from config',
    verificationMailBody: `here is the body bro`,
    emailService: new EmailService(),
  },
};

const authController = new AuthController(config).getRouter();
app.use('/auth', authController);
app.get('/auth/profile', (req, res) => {
  res.send('Protected route!');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```
## Tests
Chai and Mocha has been used for testing purpose, here's how you can test this package:
1) Import express app context and User model from your local express app into the test files.
2) Run `npm run test` to test.


## Conclusion

auth-ez simplifies the implementation of authentication features in your Node.js application. Customize the configuration and implement the abstract methods to integrate with your specific data store and user model.
