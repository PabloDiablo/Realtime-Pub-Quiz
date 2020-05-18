import { Request, Response, RequestHandler, NextFunction } from 'express';
import { NotAuthorizedError } from '../../types/errors';

export function withQuizMaster(route: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.gameRoom && req.session.isQuizMaster) {
      return route(req, res, next);
    } else {
      throw new NotAuthorizedError();
    }
  };
}

export function withTeam(route: RequestHandler): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.gameRoom && req.session.teamId) {
      return route(req, res, next);
    } else {
      throw new NotAuthorizedError();
    }
  };
}
