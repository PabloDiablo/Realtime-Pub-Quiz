import { Request, Response } from 'express';
import mongoose from 'mongoose';

import TeamAnswer from '../database/model/teamAnswer';
import Question from '../database/model/questions';
import { QuestionStatus, GameStatus, TeamStatus } from '../../shared/types/status';
import { createTeamRecord, hasTeam } from '../repositories/team-realtime';
import { hasGame, getGameRecord } from '../repositories/game-realtime';

export async function createTeam(req: Request, res: Response) {
  // const gameRoomName = req.body.gameRoomName;
  // const teamName = req.body.teamName;
  // const playerCode = req.body.playerCode;

  // if (!gameRoomName || !teamName || !playerCode) {
  //   res.json({
  //     success: false,
  //     gameRoomAccepted: false,
  //     teamNameStatus: false
  //   });
  //   return;
  // }

  // const teamNameTrimmed = (teamName as string).trim();

  // //Get current game
  // const hasGameRoom = await hasGame(gameRoomName);

  // //Check if game exists
  // if (hasGameRoom) {
  //   const isTeamNameTaken = await hasTeam(gameRoomName, teamNameTrimmed);

  //   //Checks if team isn't already in current game
  //   if (isTeamNameTaken) {
  //     res.json({
  //       success: false,
  //       gameRoomAccepted: true,
  //       teamNameStatus: TeamStatus.Error
  //     });

  //     return;
  //   }

  //   try {
  //     const teamRdbRef = await createTeamRecord(gameRoomName, {
  //       accepted: false,
  //       teamName,
  //       gameRoom: gameRoomName,
  //       playerCode
  //     });

  //     res.cookie('rdbid', teamRdbRef.key, { maxAge: 86400000, httpOnly: true });

  //     res.json({
  //       success: true,
  //       rdbTeamId: teamRdbRef.key,
  //       gameRoomAccepted: true,
  //       teamNameStatus: TeamStatus.Pending,
  //       gameRoomName,
  //       teamName
  //     });
  //   } catch (err) {
  //     console.error(err);

  //     res.json({
  //       success: false,
  //       gameRoomAccepted: true,
  //       teamNameStatus: TeamStatus.Error
  //     });
  //   }
  // } else {
  res.json({
    success: false,
    gameRoomAccepted: false,
    teamNameStatus: TeamStatus.Error
  });
  // }
}

export async function submitAnswer(req: Request, res: Response) {
  const now = new Date().getTime();

  const { teamId, teamName } = res.locals;

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

export async function hasPlayerSession(req: Request, res: Response) {
  try {
    const { gameRoom } = res.locals;

    const game = await getGameRecord(gameRoom).once('value');

    const hasSession = game.exists() && game.val().game_status !== GameStatus.EndGame;

    res.json({
      success: true,
      hasSession,
      gameRoom,
      rdbTeamId: req.cookies['rdbid']
    });
  } catch (err) {
    res.json({ success: false });
  }
}

export async function getDebug(req: Request, res: Response) {
  res.json({
    success: true,
    locals: res.locals,
    rdbid: req.cookies['rdbid']
  });
}

export async function leaveGame(req: Request, res: Response) {
  res.clearCookie('rdbid');

  res.json({ success: true });
}
