import { Request, Response } from 'express';

import Round from '../database/model/rounds';
import AvailableQuestions from '../database/model/availableQuestions';
import Question from '../database/model/questions';
import Teams from '../database/model/teams';
import TeamAnswers from '../database/model/teamAnswer';
import config from '../config';
import { RoundStatus, GameStatus, QuestionStatus } from '../../shared/types/status';
import { generateRandomId } from './helpers/id';
import { updateGameRealtime, hasGame, getGameRecord } from '../repositories/game-realtime';
import { getTeamRecord, updateTeam } from '../repositories/team-realtime';
import { GameConfig, createGameConfig } from '../repositories/game-config';

export async function createGame(req: Request, res: Response) {
  //Game room name
  const gameRoomName = req.body.gameRoomName;
  const passcode = req.body.passcode;

  if (config.QM_PASS && passcode !== config.QM_PASS) {
    res.json({
      success: false,
      passcodeIncorrect: true
    });

    return;
  }

  //Check if gameRoomName is already in mongoDB
  const gameRoomExists = await hasGame(gameRoomName);

  //If gameRoomName isn't in mongoDB
  if (!gameRoomExists) {
    const quizMasterId = generateRandomId();

    const gameConfig = new GameConfig();
    gameConfig.gameRoom = gameRoomName;
    gameConfig.quizMasterId = quizMasterId;

    try {
      //save gameRoomName document to MongoDB
      await createGameConfig(gameConfig);

      console.log(`${gameRoomName} game created.`);
    } catch (err) {
      console.error(err);

      res.json({ success: false, gameRoomNameAccepted: false });

      return;
    }

    await updateGameRealtime(gameRoomName, {
      status: GameStatus.Lobby,
      question: null
    });

    res.cookie('qmid', quizMasterId, { maxAge: 86400000, httpOnly: true });

    //send result
    res.json({
      success: true,
      gameRoomNameAccepted: true,
      gameRoomName: gameRoomName
    });
  } else {
    res.json({
      success: false,
      gameRoomNameAccepted: false
    });
  }
}

// export async function getListOfPlayers(req: Request, res: Response) {
//   const gameRoom = res.locals.gameRoom;

//   try {
//     const teams = await Teams.find({ gameRoom }).lean();

//     res.json({
//       success: true,
//       teams
//     });
//   } catch (err) {
//     console.error(err);

//     res.json({
//       success: false
//     });
//   }
// }

export async function removeTeam(req: Request, res: Response) {
  const rdbid = req.params.teamName;
  const { gameRoom, teamName } = res.locals;

  try {
    await getTeamRecord(gameRoom, rdbid).remove();

    res.json({
      success: true
    });

    console.log(`${teamName} removed from gameRoom: ${gameRoom}`);
  } catch (err) {
    console.error(err);

    res.json({ success: false });

    return;
  }
}

export async function acceptTeam(req: Request, res: Response) {
  const rdbid = req.params.teamName;
  const { gameRoom, teamName } = res.locals;

  try {
    await updateTeam(gameRoom, rdbid, { accepted: true });

    res.json({
      success: true
    });

    console.log(`${teamName} accepted to gameRoom: ${gameRoom}`);
  } catch (err) {
    res.json({
      success: false
    });
  }
}

export async function setGameStatus(req: Request, res: Response) {
  const gameStatus = req.body.gameStatus;
  const gameRoom = res.locals.gameRoom;

  if (gameStatus === 'choose_category' || gameStatus === 'end_game') {
    try {
      await updateGameRealtime(gameRoom, { status: gameStatus });

      if (gameStatus === 'end_game') {
        res.clearCookie('qmid');
      }

      res.json({
        success: true,
        gameStatus
      });
    } catch (err) {
      console.error(err);

      res.json({
        success: false
      });
    }
  } else {
    res.json({
      success: false
    });
  }
}

export async function createRound(req: Request, res: Response) {
  const gameRoom = res.locals.gameRoom;
  const roundCategories = req.body.roundCategories;

  const hasSelectedCategory = roundCategories && roundCategories.length > 0;

  if (hasSelectedCategory) {
    const round = new Round({
      categories: roundCategories,
      ronde_status: RoundStatus.Open,
      gameRoom
    });

    try {
      await round.save();
    } catch (err) {
      res.json({
        success: false
      });
    }
  }

  try {
    await updateGameRealtime(gameRoom, {
      status: hasSelectedCategory ? GameStatus.ChooseQuestion : GameStatus.ChooseCategory
    });

    res.json({
      success: true,
      chooseCategories: !hasSelectedCategory
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false
    });
  }
}

export async function getAllCategories(req: Request, res: Response) {
  const questions = await AvailableQuestions.find({}).lean();

  //get a array with unique categories
  const categories = [];
  questions.forEach(arrayItem => {
    if (!categories.includes(arrayItem.category)) {
      categories.push(arrayItem.category);
    }
  });

  res.json({
    success: true,
    categories
  });
}

export async function getAllQuestionsInRound(req: Request, res: Response) {
  const gameRoom = res.locals.gameRoom;

  try {
    // find current round - not RoundStatus.Ended
    const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();

    // find all questions that match round category
    // get asked questions from round
    const [allQuestionsInRound, askedQuestions] = await Promise.all([
      await AvailableQuestions.find({ category: { $in: round.categories } }).lean(),
      await Question.find({ round: round._id }).lean()
    ]);

    const askedQuestionIds = askedQuestions.map(q => String(q.availableQuestion));

    // filter out asked questions
    const filteredQuestions = allQuestionsInRound.filter(q => !askedQuestionIds.includes(String(q._id)));

    res.json({
      success: true,
      questions: filteredQuestions
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false
    });
  }
}

export async function startQuestion(req: Request, res: Response) {
  const gameRoom = res.locals.gameRoom;

  const question = req.body.question;

  // if req.body.question - start question
  if (question) {
    try {
      // find questions in round
      const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();
      const questionToAsk = await AvailableQuestions.findById(question._id).lean();

      // create question model
      const questionModel = new Question({
        vraag: questionToAsk.question,
        image: questionToAsk.image,
        antwoord: questionToAsk.answer,
        categorie_naam: questionToAsk.category,
        status: QuestionStatus.Open,
        round: round._id,
        availableQuestion: question._id
      });

      // set round_status to asking_question
      const roundModelP = Round.findByIdAndUpdate(round._id, { ronde_status: RoundStatus.AskingQuestion });

      const [savedQuestionModel] = await Promise.all([questionModel.save(), roundModelP]);

      await updateGameRealtime(gameRoom, {
        status: GameStatus.AskingQuestion,
        question: {
          question: questionToAsk.question,
          questionId: savedQuestionModel._id.toString(),
          image: questionToAsk.image ?? null,
          category: questionToAsk.category
        }
      });

      res.json({
        success: true,
        round_ended: false,
        show_questions: false,
        question: questionToAsk.question,
        questionId: savedQuestionModel._id,
        image: questionToAsk.image,
        category: questionToAsk.category,
        answer: questionToAsk.answer
      });
    } catch (err) {
      console.error(err);

      res.json({ success: false });
    }
  } else {
    // else - end question

    try {
      // find questions in round
      const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();
      const allQuestionsInRound = await AvailableQuestions.find({ category: { $in: round.categories } }).lean();
      const askedQuestions = await Question.find({ round: round._id }).lean();

      const currentQuestion = askedQuestions.find(q => q.status === QuestionStatus.Closed);

      const haveAllQuestionsBeenAsked = askedQuestions.length === allQuestionsInRound.length;

      const roundModelP = Round.findByIdAndUpdate(round._id, {
        ronde_status: haveAllQuestionsBeenAsked ? RoundStatus.Ended : RoundStatus.ChoosingQuestion
      });

      const questionModelP = Question.findByIdAndUpdate(currentQuestion._id, { status: QuestionStatus.Ended });

      await Promise.all([roundModelP, questionModelP]);

      await updateGameRealtime(gameRoom, {
        status: haveAllQuestionsBeenAsked ? GameStatus.RoundEnded : GameStatus.ChooseQuestion
      });

      res.json({
        success: true,
        round_ended: haveAllQuestionsBeenAsked,
        show_questions: true
      });
    } catch (err) {
      console.error(err);

      res.json({ success: false });
    }
  }
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
  const questionId = req.body.questionId;

  if (!questionId) {
    res.json({ success: false });

    return;
  }

  try {
    const gameRoom = res.locals.gameRoom;

    // set question status to closed
    const questionModel = await Question.findByIdAndUpdate(questionId, { status: QuestionStatus.Closed });

    // set round status to question_closed
    await Round.findByIdAndUpdate(questionModel.round, { ronde_status: RoundStatus.QuestionClosed });

    await updateGameRealtime(gameRoom, { status: GameStatus.QuestionClosed });

    res.json({
      success: true,
      gameStatus: 'question_closed'
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false
    });
  }
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

export async function hasQuizMasterSession(req: Request, res: Response) {
  try {
    const { gameRoom } = res.locals;

    const game = await getGameRecord(gameRoom).once('value');

    const hasSession = game.exists() && game.val().game_status !== GameStatus.EndGame;

    res.json({
      success: true,
      hasSession,
      gameRoom
    });
  } catch (err) {
    res.json({ success: false });
  }
}
