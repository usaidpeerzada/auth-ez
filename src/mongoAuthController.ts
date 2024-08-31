import AuthController from './authController';
import { GetUser, SaveUser, UpdateUser, IUser } from './types';
export default class CreateMongoAuthController extends AuthController {
  async getUser(data: GetUser): Promise<IUser> {
    let user: IUser;
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

  async saveUser(params: SaveUser): Promise<IUser> {
    const { username, email, password, ...rest } = params;
    const user = new this.User({ username, email, password, ...rest });
    await user.save();
    return user;
  }

  async updateUser(params: UpdateUser): Promise<IUser> {
    const { id, password, ...rest } = params;
    const updateUser = await this.User.findByIdAndUpdate(id, {
      password,
      ...rest,
    });
    return updateUser;
  }
}
