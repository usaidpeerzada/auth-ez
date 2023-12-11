"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class ResponseController {
    created(res, message) {
        return (0, utils_1.createResponse)(res, 201, message);
    }
    success(res, message) {
        return (0, utils_1.createResponse)(res, 200, message);
    }
    error(res, error) {
        return (0, utils_1.createResponse)(res, 500, error);
    }
    unauthorized(res, message) {
        return (0, utils_1.createResponse)(res, 401, message);
    }
    conflict(res, message) {
        return (0, utils_1.createResponse)(res, 409, message);
    }
    clientError(res, message) {
        return (0, utils_1.createResponse)(res, 400, message);
    }
    forbidden(res, message) {
        return (0, utils_1.createResponse)(res, 403, message);
    }
    notFound(res, message) {
        return (0, utils_1.createResponse)(res, 404, message);
    }
    tooMany(res, message) {
        return (0, utils_1.createResponse)(res, 429, message);
    }
}
exports.default = ResponseController;
