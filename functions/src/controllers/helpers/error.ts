import { Request, Response, RequestHandler, NextFunction } from 'express';
import { handleError } from '../error';

export function withAsyncError(route: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(route(req, res, next)).catch(err => handleError(err, req, res, next));
  };
}
