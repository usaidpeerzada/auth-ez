"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSqlAuthController = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const authController_1 = require("./authController");
dotenv_1.default.config();
class CreateSqlAuthController extends authController_1.AuthController {
    async getUser(data) {
        let user;
        if (data?.email) {
            user = await this.User.findOne({ where: { email: data.email } });
        }
        else if (data?.username) {
            user = await this.User.findOne({ where: { username: data.username } });
        }
        else {
            user = await this.User.findOne({ where: { id: data.id } });
        }
        return user?.dataValues;
    }
    async saveUser(params) {
        const newUser = await this.User.create(params);
        await newUser.save();
        return newUser;
    }
    async updateUser(params) {
        const updateUser = await this.User.update({ password: params?.password }, { where: { id: params.id } });
        return updateUser;
    }
}
exports.CreateSqlAuthController = CreateSqlAuthController;
