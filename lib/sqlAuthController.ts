import dotenv from 'dotenv';
import { AuthController } from './authController';
import { GetUser, SaveUser, UpdateUser, User } from './types';

dotenv.config();

export class CreateSqlAuthController extends AuthController {
  async getUser(data: GetUser): Promise<User> {
    let user: User;
    if (data?.email) {
      user = await this.User.findOne({ where: { email: data.email } });
    } else if (data?.username) {
      user = await this.User.findOne({ where: { username: data.username } });
    } else {
      user = await this.User.findOne({ where: { id: data.id } });
    }
    return user?.dataValues;
  }
  async saveUser(params: SaveUser): Promise<User> {
    const newUser = await this.User.create(params);
    await newUser.save();
    return newUser;
  }
  async updateUser(params: UpdateUser): Promise<User> {
    const updateUser = await this.User.update(
      { password: params?.password },
      { where: { id: params.id } },
    );
    return updateUser;
  }
}
