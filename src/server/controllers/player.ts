import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Games from '../database/model/games';
import Team from '../database/model/teams';
import TeamAnswer from '../database/model/teamAnswer';
import Question from '../database/model/questions';
import Round from '../database/model/rounds';
import { MessageType } from '../../shared/types/socket';
import { sendMessageToQuizMaster } from '../socket/sender';
import { QuestionStatus, GameStatus, RoundStatus } from '../../shared/types/status';

export async function createTeam(req: Request, res: Response) {
  const gameRoomName = req.body.gameRoomName;
  const teamName = req.body.teamName;
  const playerCode = req.body.playerCode;

  if (!gameRoomName || !teamName || !playerCode) {
    res.json({
      success: false,
      gameRoomAccepted: false,
      teamNameStatus: false
    });
    return;
  }

  //Get current game
  const hasGameRoom = await Games.exists({ _id: gameRoomName });

  //Check if game exists
  if (hasGameRoom) {
    const isTeamNameTaken = await Team.exists({ gameRoom: gameRoomName, name: teamName });

    //Checks if team isn't already in current game
    if (isTeamNameTaken) {
      res.json({
        success: false,
        gameRoomAccepted: true,
        teamNameStatus: 'error'
      });

      return;
    }

    const game = await Games.findById(gameRoomName);

    const team = new Team({
      name: teamName,
      gameRoom: game._id,
      approved: false,
      playerCode
    });

    try {
      const savedTeamModel = await team.save();

      req.session.gameRoom = gameRoomName;
      req.session.teamId = savedTeamModel._id;
      req.session.teamName = teamName;
      req.session.isQuizMaster = false;

      // game has already begun
      const gameHasBegun = game.game_status !== GameStatus.Lobby;

      sendMessageToQuizMaster(
        {
          messageType: gameHasBegun ? MessageType.NewTeamLate : MessageType.NewTeam,
          teamName,
          playerCode,
          teamId: savedTeamModel._id
        },
        gameRoomName
      );

      res.json({
        success: true,
        id: req.session.id,
        gameRoomAccepted: true,
        teamNameStatus: 'pending',
        gameRoomName: gameRoomName,
        teamName: teamName
      });
    } catch (err) {
      console.error(err);

      res.json({
        success: false,
        gameRoomAccepted: true,
        teamNameStatus: 'error'
      });
    }
  } else {
    res.json({
      success: false,
      gameRoomAccepted: false,
      teamNameStatus: 'error'
    });
  }
}

export async function submitAnswer(req: Request, res: Response) {
  const now = new Date().getTime();

  // get gameroom and teamId
  const { gameRoom, teamId, teamName } = req.session;

  const submittedAnswer = req.body.teamAnswer;
  const questionId = req.body.questionId;

  if (!questionId) {
    res.json({ success: false });

    return;
  }

  try {
    // get open question in round
    const questionObjectId = mongoose.Types.ObjectId(questionId) as any;
    const isQuestionOpen = await Question.exists({ _id: questionObjectId, status: QuestionStatus.Open });

    // return success false if no open question
    if (!isQuestionOpen) {
      console.log(`Player ${teamName} tried to answer closed question.`);

      res.json({
        success: false
      });

      return;
    }

    // if team answer model exists for this teamId and questionId
    const teamAnswer = await TeamAnswer.findOne({ question: questionObjectId, team: teamId });

    if (teamAnswer) {
      // if answer has changed
      if (teamAnswer.gegeven_antwoord !== submittedAnswer) {
        // update answer and timestamp
        teamAnswer.gegeven_antwoord = submittedAnswer;
        teamAnswer.timestamp = now;

        await teamAnswer.save();
      }
    } else {
      // create new team answer model
      const teamAnswerModel = new TeamAnswer({
        team: teamId,
        question: questionObjectId,
        gegeven_antwoord: submittedAnswer,
        correct: null,
        timestamp: now
      });

      await teamAnswerModel.save();
    }

    sendMessageToQuizMaster({ messageType: MessageType.GetQuestionAnswers }, gameRoom);

    res.json({
      success: true,
      teamName: teamName,
      teamAnswer: submittedAnswer
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false
    });
  }
}

async function getCurrentQuestion(gameRoom: string) {
  // get current round
  const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();

  const questions = await Question.find({ round: round._id }).lean();

  const question = questions.find(q => q.status === QuestionStatus.Open);

  return {
    ...question,
    maxQuestions: questions.length
  };
}

export async function hasPlayerSession(req: Request, res: Response) {
  try {
    const gameRoom = req.session.gameRoom;

    const game = await Games.findById(gameRoom).lean();

    const hasSession = game && game.game_status !== GameStatus.EndGame;
    const isAskingQuestion = hasSession && game.game_status === GameStatus.AskingQuestion;

    const questionData = isAskingQuestion ? await getCurrentQuestion(gameRoom) : undefined;

    res.json({
      success: true,
      hasSession,
      gameStatus: game.game_status,
      questionData
    });
  } catch (err) {
    res.json({ success: false });
  }
}

export async function getDebug(req: Request, res: Response) {
  res.json({
    success: true,
    session: req.session
  });
}
