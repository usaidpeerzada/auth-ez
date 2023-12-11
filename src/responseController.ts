import IResponse from './response';
import { createResponse } from './utils';
import { Response } from 'express';
import { SuccessResponse, ErrResponse } from './types';

export default class ResponseController implements IResponse {
  created(res: Response, message: SuccessResponse): Response {
    return createResponse(res, 201, message);
  }

  success(res: Response, message: SuccessResponse): Response {
    return createResponse(res, 200, message);
  }

  error(res: Response, error: ErrResponse): Response {
    return createResponse(res, 500, error);
  }

  unauthorized(res: Response, message: ErrResponse): Response {
    return createResponse(res, 401, message);
  }

  conflict(res: Response, message: ErrResponse): Response {
    return createResponse(res, 409, message);
  }

  clientError(res: Response, message: ErrResponse): Response {
    return createResponse(res, 400, message);
  }

  forbidden(res: Response, message: ErrResponse): Response {
    return createResponse(res, 403, message);
  }

  notFound(res: Response, message: ErrResponse): Response {
    return createResponse(res, 404, message);
  }

  tooMany(res: Response, message: ErrResponse): Response {
    return createResponse(res, 429, message);
  }
}
