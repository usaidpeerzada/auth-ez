"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = __importDefault(require("./authController"));
class CreateSqlAuthController extends authController_1.default {
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
exports.default = CreateSqlAuthController;
