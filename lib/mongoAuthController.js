"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMongoAuthController = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const authController_1 = require("./authController");
dotenv_1.default.config();
class CreateMongoAuthController extends authController_1.AuthController {
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
        const { username, email, password } = params;
        const user = new this.User({ username, email, password });
        await user.save();
        return user;
    }
    async updateUser(params) {
        const { id, password } = params;
        const updateUser = await this.User.findByIdAndUpdate(id, { password });
        return updateUser;
    }
}
exports.CreateMongoAuthController = CreateMongoAuthController;
