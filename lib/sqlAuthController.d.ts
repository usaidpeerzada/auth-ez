import AuthController from './authController';
import { GetUser, SaveUser, UpdateUser, IUser } from './types';
export default class CreateSqlAuthController extends AuthController {
    getUser(data: GetUser): Promise<IUser>;
    saveUser(params: SaveUser): Promise<IUser>;
    updateUser(params: UpdateUser): Promise<IUser>;
}
