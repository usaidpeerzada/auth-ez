"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrEmpty = exports.verifyRefreshToken = exports.generateRefreshToken = exports.markEmailAsVerified = exports.createResponse = exports.protectedRoutes = exports.verifyToken = exports.generateToken = exports.comparePasswords = exports.hashPassword = void 0;
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
    const secretKey = process.env.JWT_SECRET_KEY;
    const options = userOptions && Object.keys(userOptions)?.length
        ? userOptions
        : { expiresIn: '1h' };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
}
exports.generateToken = generateToken;
function verifyToken(token) {
    try {
        const secretKey = process.env.JWT_SECRET_KEY;
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
    catch (err) {
        return { message: err, status: 401 };
    }
}
exports.verifyToken = verifyToken;
function protectedRoutes(routes, User) {
    return async (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const unprotectedRoutes = routes && Object.values(routes);
        if (unprotectedRoutes.includes(req.path)) {
            return next();
        }
        const payload = verifyToken(token);
        if (!token || !verifyToken(token) || verifyToken(token)?.status === 401) {
            return res.status(401).json({ error: 'Unauthorized', code: 401 });
        }
        const user = await User.findById(payload.userId)
            .select('-password')
            .lean()
            .exec();
        if (!user) {
            return res.status(401).end();
        }
        req.user = user;
        next();
    };
}
exports.protectedRoutes = protectedRoutes;
function createResponse(res, code, message) {
    res.status(code).json({ ...message, code });
}
exports.createResponse = createResponse;
async function markEmailAsVerified(userId, User) {
    try {
        await User.updateOne({ _id: userId }, { emailVerified: true });
    }
    catch (error) {
        console.error('Error marking email as verified:', error);
        throw new Error('Failed to mark email as verified');
    }
}
exports.markEmailAsVerified = markEmailAsVerified;
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
}
exports.generateRefreshToken = generateRefreshToken;
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
}
exports.verifyRefreshToken = verifyRefreshToken;
function isNullOrEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
        if (Object.keys(value).length === 0) {
            return true;
        }
    }
    if (value instanceof Map || value instanceof Set) {
        return value.size === 0;
    }
    return false;
}
exports.isNullOrEmpty = isNullOrEmpty;
