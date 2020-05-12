import { Request, Response } from 'express';

import Games from '../database/model/games';
import Team from '../database/model/teams';
import TeamAnswer from '../database/model/teamAnswer';
import { createSession, getSessionById, hasSession, getQuizMasterSocketHandleByGameRoom } from '../session';
import { MessageType } from '../../shared/types/socket';

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
  const currentGame = await Games.findOne({ _id: gameRoomName });

  //Check if game exits && dat die nog niet begonnen is
  if (currentGame) {
    //check of teamName available is
    const isTeamNameAvailable = Array.from(currentGame.teams).every(t => t._id !== teamName);

    //Checks if team isn't already in current game
    if (isTeamNameAvailable) {
      currentGame.teams.push(
        new Team({
          _id: teamName,
          approved: false,
          round_score: 0,
          team_score: 0,
          playerCode
        })
      );

      //Save to mongoDB
      currentGame.save(err => {
        if (err) return console.error(err);

        res.json({
          success: true,
          id: req.session.id,
          gameRoomAccepted: true,
          teamNameStatus: 'pending',
          gameRoomName: gameRoomName,
          teamName: teamName
        });
      });

      createSession(req.session.id, teamName, gameRoomName);

      // game has already begun
      if (currentGame.game_status !== 'lobby') {
        // alert quiz master over socket
        const playerSocket = getQuizMasterSocketHandleByGameRoom(gameRoomName);
        playerSocket.send(
          JSON.stringify({
            messageType: MessageType.NewTeamLate,
            teamName,
            playerCode
          })
        );
      }
    } else {
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
      teamNameStatus: false
    });
  }
}

export async function submitAnswer(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;
  const teamName = req.params.teamName;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName & is quizMaster
  if (session.gameRoom === gameRoomName) {
    const teamAnswer = req.body.teamAnswer;

    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

    const roundID = currentGame.rondes.findIndex(r => r.ronde_status === 'asking_question');

    // no open question
    if (roundID < 0) {
      res.json({
        success: false
      });

      return;
    }

    const questionID = currentGame.rondes[roundID].vragen.length - 1;
    const timestamp = new Date().getTime();

    let isAlreadyAnswered = false;
    let teamKey = null;

    //Check if team has already answered
    currentGame.rondes[roundID].vragen[questionID].team_antwoorden.forEach((arrayItem, key) => {
      if (arrayItem.team_naam.includes(teamName) && arrayItem.team_naam === teamName) {
        isAlreadyAnswered = true;
        teamKey = key;
      }
    });

    if (isAlreadyAnswered) {
      const teamAnswerRef = currentGame.rondes[roundID].vragen[questionID].team_antwoorden[teamKey];

      if (teamAnswerRef.gegeven_antwoord !== teamAnswer) {
        teamAnswerRef.gegeven_antwoord = teamAnswer;
        teamAnswerRef.timestamp = timestamp;
      }
    } else {
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden.push(
        new TeamAnswer({
          team_naam: teamName,
          gegeven_antwoord: teamAnswer,
          correct: null,
          timestamp
        })
      );
    }

    try {
      //Save to mongoDB
      await currentGame.save();

      res.json({
        success: true,
        teamName: teamName,
        teamAnswer: teamAnswer
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

export function hasPlayerSession(req: Request, res: Response) {
  res.json({
    success: true,
    hasSession: hasSession(req.session.id)
  });
}
