import IResponse from './response';
import { Response } from 'express';
import { SuccessResponse, ErrResponse } from './types';
export default class ResponseController implements IResponse {
    created(res: Response, message: SuccessResponse): Response;
    success(res: Response, message: SuccessResponse): Response;
    error(res: Response, error: ErrResponse): Response;
    unauthorized(res: Response, message: ErrResponse): Response;
    conflict(res: Response, message: ErrResponse): Response;
    clientError(res: Response, message: ErrResponse): Response;
    forbidden(res: Response, message: ErrResponse): Response;
    notFound(res: Response, message: ErrResponse): Response;
    tooMany(res: Response, message: ErrResponse): Response;
}
