import { GetUser, SaveUser, UpdateUser, IUser } from './types';

export default interface IAuthEZDataStore {
  getUser(params: GetUser): Promise<IUser>;
  saveUser(params: SaveUser): Promise<IUser>;
  updateUser(params: UpdateUser): Promise<IUser>;
}
