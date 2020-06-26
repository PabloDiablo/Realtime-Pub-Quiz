import { Request, Response, RequestHandler, NextFunction } from 'express';

import { NotAuthorizedError } from '../../types/errors';
import { getGameConfigRepository } from '../../repositories/game-config';
import { findTeamInAllGameRooms } from '../../repositories/team-realtime';

export function withQuizMaster(route: RequestHandler): RequestHandler {
  return async function(req: Request, res: Response, next: NextFunction) {
    const qmid = req.cookies['qmid'];
    if (qmid) {
      // const game = await getGameConfigRepository()
      //   .whereEqualTo('quizMasterId', qmid)
      //   .findOne();

      const game = true;

      if (game) {
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
      const team = await findTeamInAllGameRooms(rdbid);

      if (team) {
        res.locals = {
          gameRoom: team.gameRoom,
          teamName: team.teamName
        };

        return route(req, res, next);
      }
    }

    throw new NotAuthorizedError();
  };
}
