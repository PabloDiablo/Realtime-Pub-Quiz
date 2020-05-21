import { Request, Response } from 'express';

import Games from '../database/model/games';
import Round from '../database/model/rounds';
import AvailableQuestions from '../database/model/availableQuestions';
import Question from '../database/model/questions';
import Teams from '../database/model/teams';
import TeamAnswers from '../database/model/teamAnswer';
import { MessageType } from '../../shared/types/socket';
import config from '../config';
import { sendMessageToAllPlayers, sendMessageToTeam } from '../socket/sender';
import { RoundStatus, GameStatus, QuestionStatus } from '../../shared/types/status';
import { reloadSessionData } from '../session';

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
  const gameRoomExists = await Games.exists({ _id: gameRoomName });

  //If gameRoomName isn't in mongoDB
  if (!gameRoomExists) {
    //create gameRoomName
    const newGame = new Games({
      _id: gameRoomName,
      game_status: GameStatus.Lobby
    });

    try {
      //save gameRoomName document to MongoDB
      await newGame.save();

      console.log(`${gameRoomName} saved to Games collection.`);
    } catch (err) {
      console.error(err);

      res.json({ success: false, gameRoomNameAccepted: false });

      return;
    }

    req.session.gameRoom = gameRoomName;
    req.session.isQuizMaster = true;
    req.session.teamId = undefined;
    req.session.teamName = undefined;

    //send result
    res.json({
      success: true,
      gameRoomNameAccepted: true,
      QuizMaster: true,
      gameRoomName: gameRoomName
    });

    // reload session data in socket
    reloadSessionData(req.sessionID);
  } else {
    res.json({
      success: false,
      gameRoomNameAccepted: false
    });
  }
}

export async function getListOfPlayers(req: Request, res: Response) {
  const gameRoom = req.session.gameRoom;

  try {
    const teams = await Teams.find({ gameRoom }).lean();

    res.json({
      success: true,
      teams
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false
    });
  }
}

export async function removeTeam(req: Request, res: Response) {
  const teamId = req.params.teamName;
  const gameRoom = req.session.gameRoom;

  try {
    const team = await Teams.findByIdAndRemove(teamId);

    sendMessageToTeam({ messageType: MessageType.TeamDeleted }, teamId);

    res.json({
      success: true
    });

    console.log(`${team.name} (${teamId}) removed from gameRoom: ${gameRoom}`);
  } catch (err) {
    console.error(err);

    res.json({ success: false });

    return;
  }
}

export async function acceptTeam(req: Request, res: Response) {
  const teamId = req.params.teamName;
  const gameRoom = req.session.gameRoom;

  try {
    const team = await Teams.findByIdAndUpdate(teamId, { approved: true });

    sendMessageToTeam({ messageType: MessageType.TeamAccepted }, teamId);

    res.json({
      success: true
    });

    console.log(`${team.name} (${teamId}) accepted to gameRoom: ${gameRoom}`);
  } catch (err) {
    res.json({
      success: false
    });
  }
}

export async function startOrEndGame(req: Request, res: Response) {
  const gameStatus = req.body.gameStatus;
  const gameRoom = req.session.gameRoom;

  if (gameStatus === 'choose_category' || gameStatus === 'end_game') {
    try {
      await Games.findByIdAndUpdate(gameRoom, { game_status: gameStatus });

      if (gameStatus === 'choose_category') {
        sendMessageToAllPlayers({ messageType: MessageType.ChooseCategories }, gameRoom);
      }

      if (gameStatus === 'end_game') {
        sendMessageToAllPlayers({ messageType: MessageType.EndGame }, gameRoom);
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
  const gameRoom = req.session.gameRoom;
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
    const gameStatus = hasSelectedCategory ? 'choose_question' : 'choose_category';
    await Games.findByIdAndUpdate(gameRoom, { game_status: gameStatus });

    sendMessageToAllPlayers(
      {
        messageType: hasSelectedCategory ? MessageType.ChooseQuestion : MessageType.ChooseCategories
      },
      gameRoom
    );

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
  const gameRoom = req.session.gameRoom;

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
  const gameRoom = req.session.gameRoom;

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

      // set game_status to asking_question
      const gameModelP = Games.findByIdAndUpdate(gameRoom, { game_status: GameStatus.AskingQuestion });

      // set round_status to asking_question
      const roundModelP = Round.findByIdAndUpdate(round._id, { ronde_status: RoundStatus.AskingQuestion });

      const [savedQuestionModel] = await Promise.all([questionModel.save(), gameModelP, roundModelP]);

      sendMessageToAllPlayers(
        {
          messageType: MessageType.AskingQuestion,
          question: questionToAsk.question,
          questionId: savedQuestionModel._id,
          image: questionToAsk.image,
          category: questionToAsk.category
        },
        gameRoom
      );

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

      const gameModelP = Games.findByIdAndUpdate(gameRoom, {
        game_status: haveAllQuestionsBeenAsked ? GameStatus.RoundEnded : GameStatus.ChooseQuestion
      });

      const roundModelP = Round.findByIdAndUpdate(round._id, {
        ronde_status: haveAllQuestionsBeenAsked ? RoundStatus.Ended : RoundStatus.ChoosingQuestion
      });

      const questionModelP = Question.findByIdAndUpdate(currentQuestion._id, { status: QuestionStatus.Ended });

      await Promise.all([gameModelP, roundModelP, questionModelP]);

      sendMessageToAllPlayers(
        {
          messageType: haveAllQuestionsBeenAsked ? MessageType.EndRound : MessageType.ChooseQuestion
        },
        gameRoom
      );

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
      answers
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
    const gameRoom = req.session.gameRoom;

    // set game status to question_closed
    const gameModelP = Games.findByIdAndUpdate(gameRoom, { game_status: GameStatus.QuestionClosed });

    // set question status to closed
    const questionModelP = Question.findByIdAndUpdate(questionId, { status: QuestionStatus.Closed });

    const [, questionModel] = await Promise.all([gameModelP, questionModelP]);

    // set round status to question_closed
    await Round.findByIdAndUpdate(questionModel.round, { ronde_status: RoundStatus.QuestionClosed });

    res.json({
      success: true,
      gameStatus: 'question_closed'
    });

    sendMessageToAllPlayers({ messageType: MessageType.QuestionClosed }, gameRoom);
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
