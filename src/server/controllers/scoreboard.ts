import { Request, Response } from 'express';

import Games from '../database/model/games';

interface ILocalRound {
  questionsCount: number;
  category: string;
  questions: {
    question: string;
    answer: string;
    teams: {
      teamName: string;
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
  teamTotals: Record<string, number>;
}

export async function getScores(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;

  //Get current game
  let currentGame = await Games.findOne({ _id: gameRoomName });

  //Check if game exits
  if (currentGame) {
    const rounds: Record<number, ILocalRound> = {};
    const teams = {};

    currentGame.rondes.forEach((round, index) => {
      rounds[index] = {
        questionsCount: round.vragen.length,
        category: round.categories[0],
        questions: round.vragen.map(q => ({
          question: q.vraag,
          answer: q.antwoord,
          teams: q.team_antwoorden.map(a => ({
            teamName: a.team_naam,
            answer: a.gegeven_antwoord,
            isCorrect: a.correct
          }))
        })),
        teamTotals: {}
      };
    });

    Object.values(rounds).forEach((round, index) => {
      const teamTotals = {};

      round.questions.forEach(q => {
        q.teams.forEach(t => {
          if (!teamTotals[t.teamName]) {
            teamTotals[t.teamName] = 0;
          }

          if (!teams[t.teamName]) {
            teams[t.teamName] = 0;
          }
        });
      });

      Object.keys(teamTotals).forEach(team => {
        teamTotals[team] = round.questions.reduce((prev, curr) => prev + curr.teams.filter(t => t.teamName === team && t.isCorrect).length, 0);

        teams[team] = teams[team] + teamTotals[team];
      });

      rounds[index].teamTotals = teamTotals;
    });

    res.json({
      success: true,
      gameRoomName: gameRoomName,
      currentTeams: currentGame.teams,
      rounds: rounds,
      teams: teams
    });
  } else {
    res.json({
      success: false
    });
  }
}
