import AuthController from './authController';
import { GetUser, SaveUser, UpdateUser, IUser } from './types';
export default class CreateSqlAuthController extends AuthController {
  async getUser(data: GetUser): Promise<IUser> {
    let user: IUser;
    if (data?.email) {
      user = await this.User.findOne({ where: { email: data.email } });
    } else if (data?.username) {
      user = await this.User.findOne({ where: { username: data.username } });
    } else {
      user = await this.User.findOne({ where: { id: data.id } });
    }
    return user?.dataValues;
  }
  async saveUser(params: SaveUser): Promise<IUser> {
    const newUser = await this.User.create(params);
    await newUser.save();
    return newUser;
  }
  async updateUser(params: UpdateUser): Promise<IUser> {
    const updateUser = await this.User.update(
      { password: params?.password, refreshToken: params.refreshToken },
      { where: { id: params.id } },
    );
    return updateUser;
  }
}
