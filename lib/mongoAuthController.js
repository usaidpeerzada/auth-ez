"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = __importDefault(require("./authController"));
class CreateMongoAuthController extends authController_1.default {
    async getUser(data) {
        let user;
        if (data?.email) {
            user = await this.User.findOne({ email: data?.email });
        }
        else if (data?.username) {
            user = await this.User.findOne({ username: data?.username });
        }
        else if (data?.id) {
            user = await this.User.findById(data.id);
        }
        else {
            user = await this.User.findOne({
                $or: [{ username: data.username }, { email: data.email }],
            });
        }
        return user;
    }
    async saveUser(params) {
        const { username, email, password, ...rest } = params;
        const user = new this.User({ username, email, password, ...rest });
        await user.save();
        return user;
    }
    async updateUser(params) {
        const { id, password, ...rest } = params;
        const updateUser = await this.User.findByIdAndUpdate(id, {
            password,
            ...rest,
        });
        return updateUser;
    }
}
exports.default = CreateMongoAuthController;
