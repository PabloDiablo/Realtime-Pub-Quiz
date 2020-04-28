import { Request, Response } from 'express';

import Games from '../database/model/games';
import Team from '../database/model/teams';
import TeamAnswer from '../database/model/teamAnswer';

export async function createTeam(req: Request, res: Response) {
  const gameRoomName = req.body.gameRoomName;
  const teamName = req.body.teamName;

  //Get current game
  const currentGame = await Games.findOne({ _id: gameRoomName });

  //Check if game exits && dat die nog niet begonnen is
  if (currentGame) {
    if (currentGame.game_status === 'lobby') {
      //check of teamName available is
      let isTeamNameAvailable = true;
      currentGame.teams.forEach(arrayItem => {
        if (arrayItem['_id'] === teamName) {
          isTeamNameAvailable = false;
        }
      });

      //Checks if team isn't already in current game
      if (isTeamNameAvailable) {
        currentGame.teams.push(
          new Team({
            _id: teamName,
            approved: false,
            round_score: 0,
            team_score: 0
          })
        );

        //Save to mongoDB
        currentGame.save(function(err) {
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

        //set session gameRoomName
        req.session.gameRoomName = gameRoomName;

        //set session teamName
        req.session.teamName = teamName;

        //set session quizMaster = false
        req.session.quizMaster = false;
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
        gameRoomAccepted: true,
        teamNameStatus: 'already-started'
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
  const roundID = Number(req.params.rondeID) - 1;
  const questionID = Number(req.params.questionID) - 1;
  const teamName = req.params.teamName;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName) {
    const teamAnswer = req.body.teamAnswer;

    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

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
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden[teamKey].gegeven_antwoord = teamAnswer;
    } else {
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden.push(
        new TeamAnswer({
          team_naam: teamName,
          gegeven_antwoord: teamAnswer,
          correct: null
        })
      );
    }

    //Save to mongoDB
    currentGame.save(err => {
      if (err) return console.error(err);

      res.json({
        success: true,
        teamName: teamName,
        teamAnswer: teamAnswer
      });
    });
  } else {
    res.json({
      success: false
    });
  }
}
