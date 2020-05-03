import express from 'express';
import bodyParser from 'body-parser';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import * as errorController from './error';
import * as playerController from './player';
import * as quizMasterController from './quiz-master';
import * as scoreboardController from './scoreboard';
import { withAsyncError } from './helpers/error';
import { withQuizMaster } from './helpers/auth';
import { handleError } from './error';

mongoose.set('useCreateIndex', true);

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
router.get('/games/:gameRoom/scoreboard', scoreboardController.getScores);

// quiz master
router.post('/game', quizMasterController.createGame);
quizMasterRouter.get('/games/:gameRoom/teams', quizMasterController.getListOfPlayers);
quizMasterRouter.delete('/games/:gameRoom/team/:teamName', quizMasterController.removeTeam);
quizMasterRouter.put('/games/:gameRoom/team/:teamName', quizMasterController.acceptTeam);
quizMasterRouter.put('/games/:gameRoom', quizMasterController.startOrEndGame);
quizMasterRouter.post('/games/:gameRoom/ronde', quizMasterController.createRound);
quizMasterRouter.get('/questions/categories', quizMasterController.getAllCategories);
quizMasterRouter.get('/game/:gameRoom/ronde/:rondeID/questions', quizMasterController.getAllQuestionsInRound);
quizMasterRouter.post('/game/:gameRoom/ronde/:roundID/question', quizMasterController.startQuestion);
quizMasterRouter.get('/game/:gameRoom/ronde/:rondeID/question/:questionID/answers', quizMasterController.getAllAnswersForQuestion);
quizMasterRouter.put('/game/:gameRoom/ronde/:rondeID/question', quizMasterController.closeQuestion);
quizMasterRouter.put('/game/:gameRoom/ronde/:rondeID/question/:questionID/team/:teamName/answer', quizMasterController.setAnswerState);

// player
router.get('/session', playerController.hasPlayerSession);
router.post('/team', playerController.createTeam);
router.post('/game/:gameRoom/ronde/:rondeID/question/:questionID/team/:teamName/answer', playerController.submitAnswer);

rawRouter.get('/*', errorController.notFoundError);
rawRouter.use(handleError);

export default rawRouter;
