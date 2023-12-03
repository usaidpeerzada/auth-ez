import { Response } from 'express';
import { GetUser, SaveUser, UpdateUser, User } from './types';

export default interface AuthEZDataStore {
  comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  generateToken(payload: object, userOptions: object): Promise<void>;
  hashPassword(password: string, options: object): string;
  getUser(params: GetUser): Promise<User>;
  saveUser(params: SaveUser): Promise<User>;
  updateUser(params: UpdateUser): Promise<User>;
  created(res: Response | object, message: object | string): Response;
  success(res: Response | object, message: object | string): Response;
  error(res: Response | object, error: object | string): Response;
  unauthorized(res: Response | object, message: object | string): Response;
  conflict(res: Response | object, message: object | string): Response;
  clientError(res: Response | object, message: object | string): Response;
  forbidden(res: Response | object, message: object | string): Response;
  notFound(res: Response | object, message: object | string): Response;
  tooMany(res: Response | object, message: object | string): Response;
}
