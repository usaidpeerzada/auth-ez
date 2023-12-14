"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = exports.protectedRoutes = exports.verifyToken = exports.generateToken = exports.comparePasswords = exports.hashPassword = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function hashPassword(password, saltRounds = 16) {
    return bcrypt_1.default.hash(password, saltRounds);
}
exports.hashPassword = hashPassword;
function comparePasswords(plainPassword, hashedPassword) {
    return bcrypt_1.default.compare(plainPassword, hashedPassword);
}
exports.comparePasswords = comparePasswords;
function generateToken(payload, userOptions) {
    const secretKey = process.env.AUTH_EZ_JWT_SECRET_KEY;
    const options = userOptions && Object.keys(userOptions)?.length
        ? userOptions
        : { expiresIn: '1h' };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
}
exports.generateToken = generateToken;
function verifyToken(token) {
    try {
        const secretKey = process.env.AUTH_EZ_JWT_SECRET_KEY;
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
    catch (err) {
        return { message: err, status: 401 };
    }
}
exports.verifyToken = verifyToken;
function protectedRoutes(routes) {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const unprotectedRoutes = routes && Object.values(routes);
        if (unprotectedRoutes.includes(req.path)) {
            return next();
        }
        if (!token || !verifyToken(token) || verifyToken(token)?.status === 401) {
            return res.status(401).json({ error: 'Unauthorized', code: 401 });
        }
        next();
    };
}
exports.protectedRoutes = protectedRoutes;
function createResponse(res, code, message) {
    res.status(code).json({ ...message, code });
}
exports.createResponse = createResponse;
