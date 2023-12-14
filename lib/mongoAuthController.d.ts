import AuthController from './authController';
import { GetUser, SaveUser, UpdateUser, IUser } from './types';
export default class CreateMongoAuthController extends AuthController {
    getUser(data: GetUser): Promise<IUser>;
    saveUser(params: SaveUser): Promise<IUser>;
    updateUser(params: UpdateUser): Promise<IUser>;
}
