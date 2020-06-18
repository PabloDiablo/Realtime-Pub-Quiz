import { Request, Response, RequestHandler, NextFunction } from 'express';

import { NotAuthorizedError } from '../../types/errors';
import Teams from '../../database/model/teams';

export function withQuizMaster(route: RequestHandler): RequestHandler {
  return async function(req: Request, res: Response, next: NextFunction) {
    const qmid = req.cookies['qmid'];
    if (qmid) {
      // const game = await Games.findOne({ quizMasterId: qmid }).lean();

      // TODO: check qmid in DB. hardcode to true for now
      const isAuthed = true;

      if (isAuthed) {
        return route(req, res, next);
      }
    }

    throw new NotAuthorizedError();
  };
}

export function withTeam(route: RequestHandler): RequestHandler {
  return async function(req: Request, res: Response, next: NextFunction) {
    const rdbid = req.cookies['rdbid'];
    if (rdbid) {
      const team = await Teams.findOne({ rdbid }).lean();

      if (team) {
        res.locals = {
          gameRoom: team.gameRoom,
          teamId: team._id,
          teamName: team.name
        };

        return route(req, res, next);
      }
    }

    throw new NotAuthorizedError();
  };
}
