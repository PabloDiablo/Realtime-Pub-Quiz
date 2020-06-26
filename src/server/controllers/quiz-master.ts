import { Request, Response } from 'express';

import AvailableQuestions from '../database/model/availableQuestions';
import Question from '../database/model/questions';
import Teams from '../database/model/teams';
import TeamAnswers from '../database/model/teamAnswer';
import config from '../config';
import { RoundStatus, GameStatus, QuestionStatus } from '../../shared/types/status';
import { generateRandomId } from './helpers/id';
import { LoginResponse, HasSessionResponse, CreateGameResponse, TeamStatusResponse, GameStatusResponse } from '../../shared/types/quizMaster';
import { updateGameRealtime, hasGame, getGameRecord, getGameValue } from '../repositories/game-realtime';
import { getTeamRecord, updateTeam } from '../repositories/team-realtime';
import { GameConfig, createGameConfig, Round, getGameConfigRepository } from '../repositories/game-config';
import { getAvailableQuestionsRepository } from '../repositories/available-questions';

const ONE_WEEK_MS = 604800000;

export async function hasQuizMasterSession(req: Request, res: Response<HasSessionResponse>) {
  res.json({
    success: true,
    hasSession: true
  });
}

export async function login(req: Request, res: Response<LoginResponse>) {
  const isPasscodeCorrect = !config.QM_PASS || req.body.passcode === config.QM_PASS;

  if (isPasscodeCorrect) {
    const quizMasterId = generateRandomId();
    res.cookie('qmid', quizMasterId, { maxAge: ONE_WEEK_MS, httpOnly: true, sameSite: 'strict' });
  }

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

  const gameRoomExists = await hasGame(roomName);

  if (gameRoomExists) {
    res.json({
      success: true,
      validationError: false,
      gameRoomAlreadyExists: true
    });
  }

  const gameConfig = new GameConfig();
  gameConfig.gameRoom = roomName;
  gameConfig.correctPoints = correctPoints;
  gameConfig.randomPrizePosition = randomPrizePosition;
  gameConfig.fastAnswerMethod = fastAnswerMethod;
  gameConfig.bonusPoints = bonusPoints;
  gameConfig.bonusNumTeams = bonusNumTeams;

  await createGameConfig(gameConfig);

  await updateGameRealtime(roomName, {
    status: GameStatus.Lobby,
    question: null
  });

  console.log(`${roomName} game created.`);

  res.json({
    success: true,
    validationError: false,
    gameRoomAlreadyExists: false
  });
}

export async function editGame(req: Request, res: Response) {}

export async function setTeamStatus(req: Request, res: Response<TeamStatusResponse>) {
  const { gameRoom, teamId, status } = req.body;

  if (!gameRoom || !teamId || !status) {
    res.json({ success: false });

    return;
  }

  await updateTeam(gameRoom, teamId, { status });

  res.json({
    success: true
  });
}

export async function setGameStatus(req: Request, res: Response<GameStatusResponse>) {
  const { gameRoom, status } = req.body;

  if (!gameRoom || !status) {
    res.json({ success: false });

    return;
  }

  await updateGameRealtime(gameRoom, { status });

  res.json({
    success: true
  });
}

export async function getQuestions(req: Request, res: Response) {}

export async function createQuestion(req: Request, res: Response) {}

export async function editQuestion(req: Request, res: Response) {}

// Old

export async function createRound(req: Request, res: Response) {
  const gameRoom = res.locals.gameRoom;
  const roundCategories = req.body.roundCategories;

  const hasSelectedCategory = roundCategories && roundCategories.length > 0;

  if (hasSelectedCategory) {
    const round = new Round();
    round.name = roundCategories[0];
    round.questions = [];

    const game = await getGameConfigRepository()
      .whereEqualTo('gameRoom', gameRoom)
      .findOne();

    const newRound = await game.rounds.create(round);

    await updateGameRealtime(gameRoom, {
      status: GameStatus.ChooseQuestion,
      round: {
        id: newRound.id,
        name: newRound.name
      }
    });
  } else {
    await updateGameRealtime(gameRoom, {
      status: GameStatus.ChooseCategory,
      round: null
    });
  }

  res.json({
    success: true,
    chooseCategories: !hasSelectedCategory
  });
}

export async function getAllCategories(req: Request, res: Response) {
  const questions = await getAvailableQuestionsRepository().find();

  //get a array with unique categories
  const categories = [];
  questions.forEach(question => {
    if (!categories.includes(question.category)) {
      categories.push(question.category);
    }
  });

  res.json({
    success: true,
    categories
  });
}

export async function getAllQuestionsInRound(req: Request, res: Response) {
  // const gameRoom = res.locals.gameRoom;

  // try {
  //   const game = await getGameValue(gameRoom);
  //   const gameConfig = await getGameConfigRepository()
  //     .whereEqualTo('gameRoom', gameRoom)
  //     .findOne();

  //   const round = await gameConfig.rounds.whereEqualTo('id', game.val().round.id).findOne();

  //   const availableQuestions = await getAvailableQuestionsRepository()
  //     .whereEqualTo('category', round.name)
  //     .find();

  //   // find all questions that match round category
  //   // get asked questions from round
  //   const [allQuestionsInRound, askedQuestions] = await Promise.all([
  //     await AvailableQuestions.find({ category: { $in: round.categories } }).lean(),
  //     await Question.find({ round: round._id }).lean()
  //   ]);

  //   const askedQuestionIds = askedQuestions.map(q => String(q.availableQuestion));

  //   // filter out asked questions
  //   const filteredQuestions = allQuestionsInRound.filter(q => !askedQuestionIds.includes(String(q._id)));

  //   res.json({
  //     success: true,
  //     questions: filteredQuestions
  //   });
  // } catch (err) {
  //   console.error(err);

  res.json({
    success: false
  });
  // }
}

export async function startQuestion(req: Request, res: Response) {
  // const gameRoom = res.locals.gameRoom;

  // const question = req.body.question;

  // // if req.body.question - start question
  // if (question) {
  //   try {
  //     // find questions in round
  //     const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();
  //     const questionToAsk = await AvailableQuestions.findById(question._id).lean();

  //     // create question model
  //     const questionModel = new Question({
  //       vraag: questionToAsk.question,
  //       image: questionToAsk.image,
  //       antwoord: questionToAsk.answer,
  //       categorie_naam: questionToAsk.category,
  //       status: QuestionStatus.Open,
  //       round: round._id,
  //       availableQuestion: question._id
  //     });

  //     // set round_status to asking_question
  //     const roundModelP = Round.findByIdAndUpdate(round._id, { ronde_status: RoundStatus.AskingQuestion });

  //     const [savedQuestionModel] = await Promise.all([questionModel.save(), roundModelP]);

  //     await updateGameRealtime(gameRoom, {
  //       status: GameStatus.AskingQuestion,
  //       question: {
  //         question: questionToAsk.question,
  //         questionId: savedQuestionModel._id.toString(),
  //         image: questionToAsk.image ?? null,
  //         category: questionToAsk.category
  //       }
  //     });

  //     res.json({
  //       success: true,
  //       round_ended: false,
  //       show_questions: false,
  //       question: questionToAsk.question,
  //       questionId: savedQuestionModel._id,
  //       image: questionToAsk.image,
  //       category: questionToAsk.category,
  //       answer: questionToAsk.answer
  //     });
  //   } catch (err) {
  //     console.error(err);

  //     res.json({ success: false });
  //   }
  // } else {
  //   // else - end question

  //   try {
  //     // find questions in round
  //     const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();
  //     const allQuestionsInRound = await AvailableQuestions.find({ category: { $in: round.categories } }).lean();
  //     const askedQuestions = await Question.find({ round: round._id }).lean();

  //     const currentQuestion = askedQuestions.find(q => q.status === QuestionStatus.Closed);

  //     const haveAllQuestionsBeenAsked = askedQuestions.length === allQuestionsInRound.length;

  //     const roundModelP = Round.findByIdAndUpdate(round._id, {
  //       ronde_status: haveAllQuestionsBeenAsked ? RoundStatus.Ended : RoundStatus.ChoosingQuestion
  //     });

  //     const questionModelP = Question.findByIdAndUpdate(currentQuestion._id, { status: QuestionStatus.Ended });

  //     await Promise.all([roundModelP, questionModelP]);

  //     await updateGameRealtime(gameRoom, {
  //       status: haveAllQuestionsBeenAsked ? GameStatus.RoundEnded : GameStatus.ChooseQuestion
  //     });

  //     res.json({
  //       success: true,
  //       round_ended: haveAllQuestionsBeenAsked,
  //       show_questions: true
  //     });
  //   } catch (err) {
  //     console.error(err);

  res.json({ success: false });
  // }
  // }
}

export async function getAllAnswersForQuestion(req: Request, res: Response) {
  const questionId = req.params.questionID;

  try {
    const question = await Question.findById(questionId).lean();

    const answers = await TeamAnswers.find({ question: question._id })
      .populate('team')
      .lean();

    res.json({
      success: true,
      answers,
      question: question.vraag,
      correctAnswer: question.antwoord
    });
  } catch (err) {
    res.json({
      success: false
    });
  }
}

export async function closeQuestion(req: Request, res: Response) {
  // const questionId = req.body.questionId;

  // if (!questionId) {
  //   res.json({ success: false });

  //   return;
  // }

  // try {
  //   const gameRoom = res.locals.gameRoom;

  //   // set question status to closed
  //   const questionModel = await Question.findByIdAndUpdate(questionId, { status: QuestionStatus.Closed });

  //   // set round status to question_closed
  //   await Round.findByIdAndUpdate(questionModel.round, { ronde_status: RoundStatus.QuestionClosed });

  //   await updateGameRealtime(gameRoom, { status: GameStatus.QuestionClosed });

  //   res.json({
  //     success: true,
  //     gameStatus: 'question_closed'
  //   });
  // } catch (err) {
  //   console.error(err);

  res.json({
    success: false
  });
  // }
}

export async function setAnswerState(req: Request, res: Response) {
  const teamId = req.body.teamId;
  const questionId = req.body.questionId;
  const isCorrect = Boolean(req.body.isCorrect);

  try {
    const [team, question] = await Promise.all([Teams.findById(teamId).lean(), Question.findById(questionId).lean()]);

    await TeamAnswers.findOneAndUpdate({ team: team._id, question: question._id }, { correct: isCorrect });

    const answers = await TeamAnswers.find({ question: question._id })
      .populate('team')
      .lean();

    res.json({
      success: true,
      answers
    });
  } catch (err) {
    res.json({
      success: false
    });
  }
}
