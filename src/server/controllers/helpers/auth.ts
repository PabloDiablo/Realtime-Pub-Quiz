import { Request, Response, RequestHandler, NextFunction } from 'express';

import { NotAuthorizedError } from '../../types/errors';
import { getTeamSessionRepository } from '../../repositories/team-sessions';
import { getQuizMasterSessionRepository } from '../../repositories/quiz-master-sessions';

export function withQuizMaster(route: RequestHandler): RequestHandler {
  return async function(req: Request, res: Response, next: NextFunction) {
    const qmid = req.cookies['qmid'];
    if (qmid) {
      const session = await getQuizMasterSessionRepository().findById(qmid);

      if (session) {
        return route(req, res, next);
      }
    }

    throw new NotAuthorizedError();
  };
}

export function withTeam(route: RequestHandler): RequestHandler {
  return async function(req: Request, res: Response, next: NextFunction) {
    const playerSessionId = req.cookies['playerSessionId'];
    if (playerSessionId) {
      const session = await getTeamSessionRepository().findById(playerSessionId);

      if (session) {
        res.locals = {
          gameId: session.gameId,
          teamId: session.teamId
        };

        return route(req, res, next);
      }
    }

    throw new NotAuthorizedError();
  };
}
