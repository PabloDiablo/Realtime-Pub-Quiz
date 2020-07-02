import { Request, Response } from 'express';

import config from '../config';
import { GameStatus } from '../../shared/types/status';
import { generateRandomId } from './helpers/id';
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
  TeamStatusRequest
} from '../../shared/types/quizMaster';
import { updateGameRealtime, hasGame, getGameValue } from '../repositories/game-realtime';
import { updateTeam } from '../repositories/team-realtime';
import { GameConfig, createGameConfig, getGameConfigRepository, getByGameRoom } from '../repositories/game-config';
import { getAvailableQuestionsRepository, AvailableQuestion } from '../repositories/available-questions';
import { QuizMasterSession, getQuizMasterSessionRepository } from '../repositories/quiz-master-sessions';
import { QuestionType } from '../../shared/types/enum';
import { getTeamAnswerRepository } from '../repositories/team-answers';

const ONE_WEEK_MS = 604800000;

export async function hasQuizMasterSession(req: Request, res: Response<HasSessionResponse>) {
  res.json({
    success: true,
    hasSession: true
  });
}

export async function login(req: Request, res: Response<LoginResponse>) {
  const isPasscodeCorrect = !config.QM_PASS || req.body.passcode === config.QM_PASS;

  if (!isPasscodeCorrect) {
    res.json({ success: true, isPasscodeCorrect: false });
    return;
  }

  const quizMasterSession = new QuizMasterSession();
  const quizMasterSessionObject = await getQuizMasterSessionRepository().create(quizMasterSession);

  res.cookie('qmid', quizMasterSessionObject.id, { maxAge: ONE_WEEK_MS, httpOnly: true, sameSite: 'strict' });

  res.json({
    success: true,
    isPasscodeCorrect
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

  await updateGameRealtime(roomName, {
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

  const rounds = await game.rounds.find();

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
    rounds: rounds ?? []
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

  const newRounds = rounds.filter(r => !r.id);
  const updateRounds = rounds.filter(r => r.id);

  updateRounds.forEach(async r => {
    const roundModel = await game.rounds.findById(r.id);
    roundModel.name = r.name;
    roundModel.questions = r.questions;

    game.rounds.update(roundModel);
  });

  newRounds.forEach(async r => {
    await game.rounds.create({
      name: r.name,
      questions: r.questions
    });
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
  const { type, text, image, answer, category } = req.body as CreateQuestionRequest;

  const availableQuestion = new AvailableQuestion();
  availableQuestion.type = type;
  availableQuestion.text = text;
  availableQuestion.image = image;
  availableQuestion.answer = answer;
  availableQuestion.category = category;

  await getAvailableQuestionsRepository().create(availableQuestion);

  res.json({ success: true });
}

export async function editQuestion(req: Request, res: Response<EditQuestionResponse>) {
  const { id, type, text, image, answer, category } = req.body as EditQuestionRequest;

  const availableQuestion = await getAvailableQuestionsRepository().findById(id);

  if (!availableQuestion) {
    res.json({ success: false });
  }

  availableQuestion.type = type;
  availableQuestion.text = text;
  availableQuestion.image = image;
  availableQuestion.answer = answer;
  availableQuestion.category = category;

  await getAvailableQuestionsRepository().update(availableQuestion);

  res.json({ success: true });
}

export async function getRoundsAndQuestionsInGame(req: Request, res: Response<GetRoundsAndQuestionsInGameResponse>) {
  const { gameRoom } = req.params;

  const game = await getByGameRoom(gameRoom);

  if (!game) {
    res.json({ success: false });
  }

  const roundsData = (await game.rounds.find()) ?? [];

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

  const rounds = await gameConfig.rounds.find();

  if (!rounds || rounds.length === 0) {
    res.json({ success: false });

    return;
  }

  if (game.status === GameStatus.Lobby) {
    const firstRound = rounds[0];

    updateGameRealtime(gameRoom, {
      status: GameStatus.RoundIntro,
      round: { id: firstRound.id, name: firstRound.name, numOfQuestions: firstRound.questions.length, currentQuestionNumber: 1 }
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
        category: questionData.category
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
          category: questionData.category
        }
      });
    } else {
      updateGameRealtime(gameRoom, {
        status: GameStatus.RoundEnded,
        question: null
      });
    }
  } else if (game.status === GameStatus.RoundEnded) {
    const currentGame = await getGameValue(gameRoom);
    const currentRoundIndex = rounds.findIndex(r => r.id === currentGame.round.id);
    const hasMoreRounds = currentRoundIndex < rounds.length - 1;

    if (hasMoreRounds) {
      const nextRound = rounds[currentRoundIndex + 1];

      updateGameRealtime(gameRoom, {
        status: GameStatus.RoundIntro,
        round: { id: nextRound.id, name: nextRound.name, numOfQuestions: nextRound.questions.length, currentQuestionNumber: 1 }
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
  const { teamAnswerId, isCorrect } = req.body as SetAnswerStateRequest;

  const teamAnswer = await getTeamAnswerRepository().findById(teamAnswerId);

  if (!teamAnswer) {
    res.json({ success: false });

    return;
  }

  teamAnswer.isCorrect = isCorrect;

  await getTeamAnswerRepository().update(teamAnswer);

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
