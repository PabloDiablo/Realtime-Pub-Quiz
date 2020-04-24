import { Request, Response, RequestHandler, NextFunction } from 'express';
import { NotAuthorizedError } from '../../types/errors';

export function withQuizMaster(route: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    const isQuizMaster = req.session.quizMaster;
    if (isQuizMaster) {
      return route(req, res, next);
    } else {
      throw new NotAuthorizedError();
    }
  };
}
