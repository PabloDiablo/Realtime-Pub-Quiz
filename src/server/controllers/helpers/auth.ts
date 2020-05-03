import { Request, Response, RequestHandler, NextFunction } from 'express';
import { NotAuthorizedError } from '../../types/errors';
import { getSessionById } from '../../session';

export function withQuizMaster(route: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    const session = getSessionById(req.session.id);

    if (session && session.isQuizMaster) {
      return route(req, res, next);
    } else {
      throw new NotAuthorizedError();
    }
  };
}
