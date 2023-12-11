import { Response } from 'express';

export default interface IResponse {
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
