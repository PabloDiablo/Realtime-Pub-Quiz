import express from 'express';
import bodyParser from 'body-parser';
import { RequestHandler } from 'express';

import * as errorController from './error';
import * as playerController from './player';
import * as quizMasterController from './quiz-master';
import * as scoreboardController from './scoreboard';
import { withAsyncError } from './helpers/error';
import { withQuizMaster, withTeam } from './helpers/auth';
import { handleError } from './error';

const rawRouter = express.Router();

const router = {
  get: (path: string, handler: RequestHandler) => rawRouter.get(path, withAsyncError(handler)),
  put: (path: string, handler: RequestHandler) => rawRouter.put(path, withAsyncError(handler)),
  post: (path: string, handler: RequestHandler) => rawRouter.post(path, withAsyncError(handler)),
  delete: (path: string, handler: RequestHandler) => rawRouter.delete(path, withAsyncError(handler))
};

const quizMasterRouter = {
  get: (path: string, handler: RequestHandler) => rawRouter.get(path, withAsyncError(withQuizMaster(handler))),
  put: (path: string, handler: RequestHandler) => rawRouter.put(path, withAsyncError(withQuizMaster(handler))),
  post: (path: string, handler: RequestHandler) => rawRouter.post(path, withAsyncError(withQuizMaster(handler))),
  delete: (path: string, handler: RequestHandler) => rawRouter.delete(path, withAsyncError(withQuizMaster(handler)))
};

rawRouter.use(bodyParser.json());

// scores
router.get('/games/:gameRoom/scoreboard(/:passcode)?', scoreboardController.getScores);

// quiz master
router.post('/game', quizMasterController.createGame);
quizMasterRouter.put('/games/:gameRoom', quizMasterController.setGameStatus);
quizMasterRouter.post('/games/:gameRoom/ronde', quizMasterController.createRound);
quizMasterRouter.get('/questions/categories', quizMasterController.getAllCategories);
quizMasterRouter.get('/game/:gameRoom/ronde/:rondeID/questions', quizMasterController.getAllQuestionsInRound);
quizMasterRouter.post('/game/:gameRoom/ronde/:roundID/question', quizMasterController.startQuestion);
quizMasterRouter.get('/game/:gameRoom/ronde/:rondeID/question/:questionID/answers', quizMasterController.getAllAnswersForQuestion);

quizMasterRouter.post('/game/end-game', quizMasterController.setGameStatus);
quizMasterRouter.post('/game/mark-answer', quizMasterController.setAnswerState);
quizMasterRouter.post('/game/close-question', quizMasterController.closeQuestion);

router.post('/quiz-master/login', quizMasterController.login);
quizMasterRouter.get('/quiz-master/session', quizMasterController.hasQuizMasterSession);
quizMasterRouter.post('/quiz-master/create-game', quizMasterController.createGame);
quizMasterRouter.post('/quiz-master/team-status', quizMasterController.setTeamStatus);

// player
router.get('/session', withTeam(playerController.hasPlayerSession));
router.post('/team', playerController.createTeam);
router.post('/team/submit-answer', withTeam(playerController.submitAnswer));
router.post('/team/leave-game', withTeam(playerController.leaveGame));

router.get('/debug', playerController.getDebug);

rawRouter.get('/*', errorController.notFoundError);
rawRouter.use(handleError);

export default rawRouter;
