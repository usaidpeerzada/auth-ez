# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2024-02-03

### Removed

- At this point auth-ez is pretty stable. Removed the `Unstable` tag from the package.

### Updated

- Updated `utils.ts` by changing the `process.env.AUTH_EZ_JWT_SECRET_KEY` to `process.env.JWT_SECRET_KEY`.

## [1.0.7] - 2024-02-27

### Updated

- Constants and code clean up.
  
## [1.0.8] - 2024-05-09

### Added

- Authorized user id to `login-with-email` and `login-with-username`.

## [1.0.9] - 2024-05-10

### Added

- verification email and resend verification email route.
- authenticated user to the protected route request.

## [1.1.0] - 2024-09-01

### Added

- Major Update!. Refresh token functionality.
