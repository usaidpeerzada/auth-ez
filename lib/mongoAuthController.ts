import dotenv from 'dotenv';
import { AuthController } from './authController';
import { GetUser, SaveUser, UpdateUser, User } from './types';

dotenv.config();

export class CreateMongoAuthController extends AuthController {
  async getUser(data: GetUser): Promise<User> {
    let user: User;
    if (data?.email) {
      user = await this.User.findOne({ email: data?.email });
    } else if (data?.username) {
      user = await this.User.findOne({ username: data?.username });
    } else if (data?.id) {
      user = await this.User.findById(data.id);
    } else {
      user = await this.User.findOne({
        $or: [{ username: data.username }, { email: data.email }],
      });
    }
    return user;
  }

  async saveUser(params: SaveUser): Promise<User> {
    const { username, email, password } = params;
    const user = new this.User({ username, email, password });
    await user.save();
    return user;
  }

  async updateUser(params: UpdateUser): Promise<User> {
    const { id, password } = params;
    const updateUser = await this.User.findByIdAndUpdate(id, { password });
    return updateUser;
  }
}
