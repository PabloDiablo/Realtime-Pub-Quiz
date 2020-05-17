import { Request, Response } from 'express';

import Games from '../database/model/games';
import Team from '../database/model/teams';
import TeamAnswer from '../database/model/teamAnswer';
import Round from '../database/model/rounds';
import Question from '../database/model/questions';
import { createSession, getSessionById, hasSession } from '../session';
import { MessageType } from '../../shared/types/socket';
import { sendMessageToQuizMaster } from '../socket/sender';
import { QuestionStatus, RoundStatus } from '../../shared/types/status';

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

      createSession(req.session.id, savedTeamModel._id, gameRoomName);

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

    // game has already begun
    const gameHasBegun = game.game_status !== 'lobby';

    sendMessageToQuizMaster(
      {
        messageType: gameHasBegun ? MessageType.NewTeamLate : MessageType.NewTeam,
        teamName,
        playerCode
      },
      gameRoomName
    );
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
  const session = getSessionById(req.session.id);
  const { gameRoom, teamId } = session;

  const submittedAnswer = req.body.teamAnswer;

  try {
    // get team
    const team = await Team.findById(teamId).lean();

    // get current round
    const round = await Round.findOne({ gameRoom, ronde_status: { $ne: RoundStatus.Ended } }).lean();

    // get open question in round
    const currentQuestion = await Question.findOne({ round: round._id, status: QuestionStatus.Open }).lean();

    // return success false if no open question
    if (!currentQuestion) {
      console.log(`Player ${team.name} tried to answer closed question.`);

      res.json({
        success: false
      });

      return;
    }

    // if team answer model exists for this teamId and questionId
    const teamAnswer = await TeamAnswer.findOne({ question: currentQuestion._id, team: team._id });

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
        team: team._id,
        question: currentQuestion._id,
        gegeven_antwoord: submittedAnswer,
        correct: null,
        timestamp: now
      });

      await teamAnswerModel.save();
    }

    sendMessageToQuizMaster({ messageType: MessageType.GetQuestionAnswers }, gameRoom);

    res.json({
      success: true,
      teamName: team.name,
      teamAnswer: teamAnswer
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false
    });
  }
}

export function hasPlayerSession(req: Request, res: Response) {
  res.json({
    success: true,
    hasSession: hasSession(req.session.id)
  });
}
