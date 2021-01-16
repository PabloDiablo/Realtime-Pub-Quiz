import { Request, Response } from 'express';
import * as functions from 'firebase-functions';

import { GameStatus } from '../../../types/status';
import {
  LoginResponse,
  HasSessionResponse,
  CreateGameResponse,
  TeamStatusResponse,
  GameInfoResponse,
  GameSettingsResponse,
  GamePlayerCodesResponse,
  GameRoundsResponse,
  GameRoundsRequest,
  AvailableQuestionsResponse,
  CreateQuestionResponse,
  EditQuestionResponse,
  CreateQuestionRequest,
  EditQuestionRequest,
  GetRoundsAndQuestionsInGameResponse,
  NextActionResponse,
  SetAnswerStateResponse,
  SetAnswerStateRequest,
  GetAllAnswersForQuestionResponse,
  TeamStatusRequest,
  RecalcAllScoresResponse,
  RecalcAllScoresRequest,
  AutoMarkAnswersResponse,
  AutoMarkAnswersRequest,
  ResetGameRequest,
  ResetGameResponse,
  LogoutResponse
} from '../../../types/quizMaster';
import { updateGameRealtime, hasGame, getGameValue } from '../repositories/game-realtime';
import { updateTeam, getAllTeamsValue, getAllTeamRecords } from '../repositories/team-realtime';
import { GameConfig, createGameConfig, getGameConfigRepository, getByGameRoom } from '../repositories/game-config';
import { getAvailableQuestionsRepository, AvailableQuestion } from '../repositories/available-questions';
import { QuizMasterSession, getQuizMasterSessionRepository } from '../repositories/quiz-master-sessions';
import { QuestionType } from '../../../types/enum';
import { getTeamAnswerRepository } from '../repositories/team-answers';
import { TeamScore, updateRoundsScores, RoundScore, getScores, updateScoresRealtime, getRoundScores, getScoresRecord } from '../repositories/scores-realtime';
import { getTeamSessionRepository } from '../repositories/team-sessions';

const ONE_WEEK_MS = 604800000;

export async function hasQuizMasterSession(req: Request, res: Response<HasSessionResponse>) {
  res.json({
    success: true,
    hasSession: true
  });
}

export async function login(req: Request, res: Response<LoginResponse>) {
  const passcode = functions.config().pubquiz.qm_pass;
  const isPasscodeCorrect = !passcode || req.body.passcode === passcode;

  if (!isPasscodeCorrect) {
    res.json({ success: true, isPasscodeCorrect: false });
    return;
  }

  const quizMasterSession = new QuizMasterSession();
  const quizMasterSessionObject = await getQuizMasterSessionRepository().create(quizMasterSession);

  res.cookie('__session', quizMasterSessionObject.id, { maxAge: ONE_WEEK_MS, httpOnly: true, sameSite: 'strict' });

  res.json({
    success: true,
    isPasscodeCorrect
  });
}

export async function logout(req: Request, res: Response<LogoutResponse>) {
  const qmid = req.cookies['__session'];
  await getQuizMasterSessionRepository().delete(qmid);

  res.clearCookie('__session');

  res.json({
    success: true
  });
}

export async function createGame(req: Request, res: Response<CreateGameResponse>) {
  const { roomName, correctPoints, randomPrizePosition = 0, fastAnswerMethod = 'none', bonusPoints = 0, bonusNumTeams = 0 } = req.body;

  if (!roomName || !correctPoints || isNaN(Number(correctPoints))) {
    res.json({
      success: true,
      validationError: true,
      gameRoomAlreadyExists: false
    });

    return;
  }

  const sanitisedRoomName = roomName.trim().toUpperCase();

  const gameRoomExists = await hasGame(sanitisedRoomName);

  if (gameRoomExists) {
    res.json({
      success: true,
      validationError: false,
      gameRoomAlreadyExists: true
    });
  }

  const gameConfig = new GameConfig();
  gameConfig.gameRoom = sanitisedRoomName;
  gameConfig.correctPoints = correctPoints;
  gameConfig.randomPrizePosition = randomPrizePosition;
  gameConfig.fastAnswerMethod = fastAnswerMethod;
  gameConfig.bonusPoints = bonusPoints;
  gameConfig.bonusNumTeams = bonusNumTeams;
  gameConfig.authorisedPlayerCodes = [];

  await createGameConfig(gameConfig);

  await updateGameRealtime(sanitisedRoomName, {
    status: GameStatus.Lobby,
    question: null,
    round: null
  });

  res.json({
    success: true,
    validationError: false,
    gameRoomAlreadyExists: false
  });
}

export async function getGameInfo(req: Request, res: Response<GameInfoResponse>) {
  const { gameRoom } = req.params;

  const game = await getByGameRoom(gameRoom);

  if (!game) {
    res.json({ success: false });

    return;
  }

  const gameRounds = await game.rounds.find();
  const rounds = gameRounds ? gameRounds.sort((a, b) => a.order - b.order) : [];

  res.json({
    success: true,
    id: game.id,
    gameRoom: game.gameRoom,
    correctPoints: game.correctPoints,
    randomPrizePosition: game.randomPrizePosition,
    fastAnswerMethod: game.fastAnswerMethod,
    bonusPoints: game.bonusPoints,
    bonusNumTeams: game.bonusNumTeams,
    authorisedPlayerCodes: game.authorisedPlayerCodes,
    rounds
  });
}

export async function editGameSettings(req: Request, res: Response<GameSettingsResponse>) {
  const { gameRoom, correctPoints, randomPrizePosition = 0, fastAnswerMethod = 'none', bonusPoints = 0, bonusNumTeams = 0 } = req.body;

  const game = await getByGameRoom(gameRoom);

  if (!game) {
    res.json({ success: false });

    return;
  }

  game.correctPoints = correctPoints;
  game.randomPrizePosition = randomPrizePosition;
  game.fastAnswerMethod = fastAnswerMethod;
  game.bonusPoints = bonusPoints;
  game.bonusNumTeams = bonusNumTeams;

  await getGameConfigRepository().update(game);

  res.json({
    success: true
  });
}

export async function editGamePlayerCodes(req: Request, res: Response<GamePlayerCodesResponse>) {
  const { gameRoom, playerCodes } = req.body;

  const game = await getByGameRoom(gameRoom);

  if (!game) {
    res.json({ success: false });

    return;
  }

  game.authorisedPlayerCodes = playerCodes;

  await getGameConfigRepository().update(game);

  res.json({
    success: true
  });
}

export async function editGameRounds(req: Request, res: Response<GameRoundsResponse>) {
  const { gameRoom, rounds, deleteQueue } = req.body as GameRoundsRequest;

  const game = await getByGameRoom(gameRoom);

  if (!game) {
    res.json({ success: false });

    return;
  }

  rounds.forEach(async (r, index) => {
    if (r.id) {
      const roundModel = await game.rounds.findById(r.id);
      roundModel.name = r.name;
      roundModel.questions = r.questions;
      roundModel.order = index;

      game.rounds.update(roundModel);
    } else {
      await game.rounds.create({
        name: r.name,
        questions: r.questions,
        order: index
      });
    }
  });

  deleteQueue.forEach(async roundId => {
    await game.rounds.delete(roundId);
  });

  res.json({
    success: true
  });
}

export async function setTeamStatus(req: Request, res: Response<TeamStatusResponse>) {
  const { gameRoom, teamId, status } = req.body as TeamStatusRequest;

  if (!gameRoom || !teamId || !status) {
    res.json({ success: false });

    return;
  }

  await updateTeam(gameRoom, teamId, { status });

  res.json({
    success: true
  });
}

export async function getQuestions(req: Request, res: Response<AvailableQuestionsResponse>) {
  const questions = await getAvailableQuestionsRepository().find();

  res.json({
    success: true,
    questions: questions.map(q => ({ ...q, type: q.type as QuestionType }))
  });
}

export async function createQuestion(req: Request, res: Response<CreateQuestionResponse>) {
  const { type, text, image, answer, category, possibleOptions } = req.body as CreateQuestionRequest;

  const availableQuestion = new AvailableQuestion();
  availableQuestion.type = type;
  availableQuestion.text = text;
  availableQuestion.image = image;
  availableQuestion.answer = answer;
  availableQuestion.category = category;
  availableQuestion.possibleOptions = possibleOptions;

  await getAvailableQuestionsRepository().create(availableQuestion);

  res.json({ success: true });
}

export async function editQuestion(req: Request, res: Response<EditQuestionResponse>) {
  const { id, type, text, image, answer, category, possibleOptions } = req.body as EditQuestionRequest;

  const availableQuestion = await getAvailableQuestionsRepository().findById(id);

  if (!availableQuestion) {
    res.json({ success: false });
  }

  availableQuestion.type = type;
  availableQuestion.text = text;
  availableQuestion.image = image;
  availableQuestion.answer = answer;
  availableQuestion.category = category;
  availableQuestion.possibleOptions = possibleOptions;

  await getAvailableQuestionsRepository().update(availableQuestion);

  res.json({ success: true });
}

export async function getRoundsAndQuestionsInGame(req: Request, res: Response<GetRoundsAndQuestionsInGameResponse>) {
  const { gameRoom } = req.params;

  const game = await getByGameRoom(gameRoom);

  if (!game) {
    res.json({ success: false });

    return;
  }

  const gameRoundsData = (await game.rounds.find()) ?? [];
  const roundsData = gameRoundsData.sort((a, b) => a.order - b.order);

  const rounds = await Promise.all(
    roundsData.map(async r => {
      const questionsData = await Promise.all(r.questions.map(q => getAvailableQuestionsRepository().findById(q)));

      const getQuestion = (id: string) => {
        const questionItem = questionsData.find(qd => qd.id === id);

        return { id: id, text: questionItem.text, answer: questionItem.answer };
      };

      return {
        id: r.id,
        name: r.name,
        questions: r.questions.map(getQuestion)
      };
    })
  );

  res.json({ success: true, rounds });
}

function calculateBonusPoints(game: GameConfig, index: number): number {
  const bonusPoints = game.bonusPoints ?? 0;
  const bonusNumTeams = game.bonusNumTeams ?? 0;

  switch (game.fastAnswerMethod) {
    case 'fastsingle':
      return index === 0 ? bonusPoints : 0;
    case 'fastx':
      return index < bonusNumTeams ? bonusPoints : 0;
    case 'sliding': {
      const points = bonusPoints / (index + 1);
      return points > 1 ? Math.ceil(points) : 0;
    }
    case 'descending': {
      const points = bonusPoints - index;
      return points > 0 ? points : 0;
    }
    default:
      return 0;
  }
}

async function calculateLeaderboard(gameId: string): Promise<void> {
  const roundScores = await getScores(gameId);

  const scores: Record<string, TeamScore> = {};

  Object.values(roundScores.rounds).forEach(r => {
    if (r.scores) {
      Object.values(r.scores).forEach(s => {
        if (scores[s.playerCode]) {
          scores[s.playerCode].score += s.score ?? 0;
          scores[s.playerCode].bonus += s.bonus ?? 0;
        } else {
          scores[s.playerCode] = s;
        }
      });
    }
  });

  await updateScoresRealtime(gameId, { leaderboard: scores });
}

export async function calculateScores(gameId: string, roundId: string, questionId: string): Promise<void> {
  const game = await getByGameRoom(gameId);
  const teams = await getAllTeamsValue(gameId);

  const correctPoints = game.correctPoints ?? 0;

  const roundData = await game.rounds.whereEqualTo('id', roundId).findOne();

  const allAnswers = await getTeamAnswerRepository()
    .whereEqualTo('gameId', gameId)
    .whereEqualTo('questionId', questionId)
    .find();

  const correctAnswersSorted = allAnswers.filter(a => a.timestamp !== undefined && a.isCorrect).sort((a, b) => a.timestamp - b.timestamp);
  const incorrectAnswers = allAnswers.filter(a => a.timestamp === undefined || !a.isCorrect);

  const players: TeamScore[] = [...correctAnswersSorted, ...incorrectAnswers].map((ca, index) => {
    const team = teams.find(t => t.teamId === ca.teamId);

    const bonusPoints = ca.isCorrect ? calculateBonusPoints(game, index) : 0;

    return {
      teamId: ca.teamId,
      playerCode: team?.playerCode,
      score: ca.isCorrect ? correctPoints : 0,
      bonus: bonusPoints
    };
  });

  const existingRoundScore = await getRoundScores(gameId, roundId);
  const getExistingScore = (playerCode: string) => (existingRoundScore && existingRoundScore.scores ? existingRoundScore.scores[playerCode] : undefined);

  const scores: Record<string, TeamScore> = existingRoundScore?.scores ?? {};
  players.forEach(p => {
    const existing = getExistingScore(p.playerCode);

    scores[p.playerCode] = {
      teamId: p.teamId,
      playerCode: p.playerCode,
      score: existing ? existing.score + p.score : p.score,
      bonus: existing ? existing.bonus + p.bonus : p.bonus
    };
  });

  const obj: RoundScore = {
    id: roundId,
    name: roundData.name,
    scores
  };

  await updateRoundsScores(gameId, roundId, obj);

  await calculateLeaderboard(gameId);
}

// This is very heavy DB operation. Use sparingly!
export async function recalcAllScores(req: Request, res: Response<RecalcAllScoresResponse>) {
  const { gameId } = req.body as RecalcAllScoresRequest;

  const game = await getByGameRoom(gameId);

  if (!game) {
    res.json({
      success: false
    });

    return;
  }

  const rounds = await game.rounds.find();

  if (!rounds || rounds.length === 0) {
    res.json({
      success: false
    });

    return;
  }

  const questionIds: { roundId: string; questionId: string }[] = [];

  // reset rounds
  await Promise.all(
    rounds.map(async r => {
      const obj: RoundScore = {
        id: r.id,
        name: r.name,
        scores: {}
      };

      await updateRoundsScores(gameId, r.id, obj);

      r.questions.forEach(q => questionIds.push({ roundId: r.id, questionId: q }));
    })
  );

  // reset leaderboard
  await calculateLeaderboard(gameId);

  await questionIds.reduce((chain, q) => chain.then(() => calculateScores(gameId, q.roundId, q.questionId)), Promise.resolve());

  res.json({ success: true });
}

export async function nextAction(req: Request, res: Response<NextActionResponse>) {
  const { gameRoom } = req.body;

  const game = await getGameValue(gameRoom);

  if (!game) {
    res.json({ success: false });

    return;
  }

  // check rounds are set up
  const gameConfig = await getByGameRoom(gameRoom);

  if (!gameConfig) {
    res.json({ success: false });

    return;
  }

  const gameRounds = await gameConfig.rounds.find();

  if (!gameRounds || gameRounds.length === 0) {
    res.json({ success: false });

    return;
  }

  const rounds = gameRounds.sort((a, b) => a.order - b.order);

  if (game.status === GameStatus.Lobby) {
    const firstRound = rounds[0];

    updateGameRealtime(gameRoom, {
      status: GameStatus.RoundIntro,
      round: { id: firstRound.id, name: firstRound.name, numOfQuestions: firstRound.questions.length, currentQuestionNumber: 0 }
    });
  } else if (game.status === GameStatus.RoundIntro) {
    // get first question
    const currentGame = await getGameValue(gameRoom);
    const question = rounds.find(r => r.id === currentGame.round.id).questions[0];

    if (!question) {
      res.json({ success: false });
      return;
    }

    const questionData = await getAvailableQuestionsRepository().findById(question);

    if (!questionData) {
      res.json({ success: false });
      return;
    }

    // set question data
    // set status to PreQuestion
    updateGameRealtime(gameRoom, {
      status: GameStatus.PreQuestion,
      question: {
        question: questionData.text,
        questionId: questionData.id,
        image: questionData.image,
        category: questionData.category,
        type: questionData.type,
        possibleOptions: questionData.possibleOptions ? questionData.possibleOptions.join(',') : null
      }
    });
  } else if (game.status === GameStatus.PreQuestion) {
    const currentGame = await getGameValue(gameRoom);

    // set status to AskingQuestion
    updateGameRealtime(gameRoom, {
      status: GameStatus.AskingQuestion,
      round: { ...currentGame.round, currentQuestionNumber: currentGame.round.currentQuestionNumber + 1 }
    });
  } else if (game.status === GameStatus.AskingQuestion) {
    // set status to QuestionClosed
    updateGameRealtime(gameRoom, { status: GameStatus.QuestionClosed });
  } else if (game.status === GameStatus.QuestionClosed) {
    const currentGame = await getGameValue(gameRoom);
    const currentRound = rounds.find(r => r.id === currentGame.round.id);
    const currentQuestionIndex = currentRound.questions.findIndex(r => r === currentGame.question.questionId);
    const hasUnaskedQuestions = currentQuestionIndex < currentRound.questions.length - 1;

    if (hasUnaskedQuestions) {
      const question = currentRound.questions[currentQuestionIndex + 1];
      const questionData = await getAvailableQuestionsRepository().findById(question);

      if (!questionData) {
        res.json({ success: false });
        return;
      }

      updateGameRealtime(gameRoom, {
        status: GameStatus.PreQuestion,
        question: {
          question: questionData.text,
          questionId: questionData.id,
          image: questionData.image,
          category: questionData.category,
          type: questionData.type,
          possibleOptions: questionData.possibleOptions ? questionData.possibleOptions.join(',') : null
        }
      });
    } else {
      updateGameRealtime(gameRoom, {
        status: GameStatus.RoundEnded,
        question: null
      });
    }

    calculateScores(gameRoom, currentGame.round.id, currentGame.question.questionId);
  } else if (game.status === GameStatus.RoundEnded) {
    const currentGame = await getGameValue(gameRoom);
    const currentRoundIndex = rounds.findIndex(r => r.id === currentGame.round.id);
    const hasMoreRounds = currentRoundIndex < rounds.length - 1;

    if (hasMoreRounds) {
      const nextRound = rounds[currentRoundIndex + 1];

      updateGameRealtime(gameRoom, {
        status: GameStatus.RoundIntro,
        round: { id: nextRound.id, name: nextRound.name, numOfQuestions: nextRound.questions.length, currentQuestionNumber: 0 }
      });
    } else {
      updateGameRealtime(gameRoom, {
        status: GameStatus.EndGame,
        round: null
      });
    }
  }

  res.json({ success: true });
}

export async function setAnswerState(req: Request, res: Response<SetAnswerStateResponse>) {
  const { teamAnswerId, isCorrect, shouldCalculateScores } = req.body as SetAnswerStateRequest;

  const teamAnswer = await getTeamAnswerRepository().findById(teamAnswerId);

  if (!teamAnswer) {
    res.json({ success: false });

    return;
  }

  teamAnswer.isCorrect = isCorrect;

  await getTeamAnswerRepository().update(teamAnswer);

  if (shouldCalculateScores) {
    const game = await getByGameRoom(teamAnswer.gameId);
    const round = await game.rounds.whereArrayContains('questions', teamAnswer.questionId).findOne();

    await calculateScores(teamAnswer.gameId, round.id, teamAnswer.questionId);
  }

  res.json({
    success: true
  });
}

export async function getAllAnswersForQuestion(req: Request, res: Response<GetAllAnswersForQuestionResponse>) {
  const { gameRoom, questionId } = req.params;

  const answers = await getTeamAnswerRepository()
    .whereEqualTo('gameId', gameRoom)
    .whereEqualTo('questionId', questionId)
    .find();

  res.json({
    success: true,
    answers
  });
}

export async function autoMarkAnswers(req: Request, res: Response<AutoMarkAnswersResponse>) {
  const { gameId, questionId } = req.body as AutoMarkAnswersRequest;

  const teamAnswers = await getTeamAnswerRepository()
    .whereEqualTo('gameId', gameId)
    .whereEqualTo('questionId', questionId)
    .find();

  const question = await getAvailableQuestionsRepository().findById(questionId);

  const batchOp = getTeamAnswerRepository().createBatch();

  const correctAnswer = question.answer.toUpperCase();

  teamAnswers.forEach(ta => {
    if (ta.answer && typeof ta.answer === 'string') {
      ta.isCorrect = ta.answer.trim().toUpperCase() === correctAnswer;

      batchOp.update(ta);
    }
  });

  await batchOp.commit();

  res.json({ success: true });
}

export async function resetGame(req: Request, res: Response<ResetGameResponse>) {
  const { gameId } = req.body as ResetGameRequest;

  // reset game state
  updateGameRealtime(gameId, {
    status: GameStatus.Lobby,
    round: null,
    question: null
  });

  // delete teams
  await getAllTeamRecords(gameId).remove();

  // delete scores
  await getScoresRecord(gameId).remove();

  // delete sessions
  const sessions = await getTeamSessionRepository()
    .whereEqualTo('gameId', gameId)
    .find();

  if (sessions.length > 0) {
    const batchSessions = getTeamSessionRepository().createBatch();
    sessions.forEach(s => batchSessions.delete(s));
    await batchSessions.commit();
  }

  // delete answers
  const answers = await getTeamAnswerRepository()
    .whereEqualTo('gameId', gameId)
    .find();

  if (answers.length > 0) {
    const batchAnswers = getTeamAnswerRepository().createBatch();
    answers.forEach(a => batchAnswers.delete(a));
    await batchAnswers.commit();
  }

  res.json({ success: true });
}
