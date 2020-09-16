import express from 'express';
import bodyParser from 'body-parser';
import { RequestHandler } from 'express';

import * as errorController from './error';
import * as playerController from './player';
import * as quizMasterController from './quiz-master';
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

// quiz master
router.post('/quiz-master/login', quizMasterController.login);
quizMasterRouter.post('/quiz-master/logout', quizMasterController.logout);
quizMasterRouter.get('/quiz-master/session', quizMasterController.hasQuizMasterSession);
quizMasterRouter.post('/quiz-master/create-game', quizMasterController.createGame);
quizMasterRouter.get('/quiz-master/game-info/:gameRoom', quizMasterController.getGameInfo);
quizMasterRouter.post('/quiz-master/edit-game/settings', quizMasterController.editGameSettings);
quizMasterRouter.post('/quiz-master/edit-game/player-codes', quizMasterController.editGamePlayerCodes);
quizMasterRouter.post('/quiz-master/edit-game/rounds', quizMasterController.editGameRounds);
quizMasterRouter.post('/quiz-master/team-status', quizMasterController.setTeamStatus);
quizMasterRouter.get('/quiz-master/available-questions', quizMasterController.getQuestions);
quizMasterRouter.post('/quiz-master/create-question', quizMasterController.createQuestion);
quizMasterRouter.post('/quiz-master/edit-question', quizMasterController.editQuestion);
quizMasterRouter.get('/quiz-master/get-rounds-and-questions/:gameRoom', quizMasterController.getRoundsAndQuestionsInGame);
quizMasterRouter.post('/quiz-master/next-action', quizMasterController.nextAction);
quizMasterRouter.post('/quiz-master/mark-answer', quizMasterController.setAnswerState);
quizMasterRouter.get('/quiz-master/:gameRoom/:questionId', quizMasterController.getAllAnswersForQuestion);
quizMasterRouter.post('/quiz-master/recalculate-all-scores', quizMasterController.recalcAllScores);
quizMasterRouter.post('/quiz-master/automark-answers', quizMasterController.autoMarkAnswers);
quizMasterRouter.post('/quiz-master/reset-game', quizMasterController.resetGame);

// player
router.get('/team/session', withTeam(playerController.hasPlayerSession));
router.post('/team/join', playerController.join);
router.post('/team/submit-answer', withTeam(playerController.submitAnswer));
router.post('/team/leave-game', withTeam(playerController.leaveGame));

router.get('/debug', playerController.getDebug);

rawRouter.get('/*', errorController.notFoundError);
rawRouter.use(handleError);

export default rawRouter;
