import { Request, Response } from 'express';

import Games from '../database/model/games';

interface LocalRound {
  questionsCount: number;
  category: string;
  questions: {
    question: string;
    answer: string;
    fastestAnswer: string;
    teams: {
      teamName: string;
      answer: string;
      isCorrect: boolean;
      timestamp: number;
    }[];
  }[];
  teamTotals: {
    teamName: string;
    score: number;
    bonus: number;
  }[];
}

const CORRECT_ANSWER_MULTIPLIER = 10;
const FAST_BONUS_MULTIPLIER = 5;

export async function getScores(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;

  //Get current game
  const currentGame = await Games.findOne({ _id: gameRoomName });

  const getPlayerCode = (teamName: string) => currentGame.teams.find(t => t._id === teamName)?.playerCode;

  //Check if game exits
  if (currentGame) {
    const rounds: Record<number, LocalRound> = {};
    const teams = {};

    currentGame.rondes.forEach((round, index) => {
      rounds[index] = {
        questionsCount: round.vragen.length,
        category: round.categories[0],
        questions: round.vragen.map(q => ({
          question: q.vraag,
          answer: q.antwoord,
          fastestAnswer: '',
          teams: q.team_antwoorden.map(a => ({
            teamName: a.team_naam,
            answer: a.gegeven_antwoord,
            isCorrect: a.correct,
            timestamp: a.timestamp
          }))
        })),
        teamTotals: []
      };
    });

    Object.values(rounds).forEach((round, index) => {
      const teamTotals: Record<string, { score: number; bonus: number }> = {};

      round.questions.forEach(q => {
        const fastestTeam = q.teams.sort((a, b) => a.timestamp - b.timestamp).find(a => a.isCorrect);

        if (fastestTeam) {
          q.fastestAnswer = fastestTeam.teamName;
        }

        q.teams.forEach(t => {
          if (!teamTotals[t.teamName]) {
            teamTotals[t.teamName] = { score: 0, bonus: 0 };
          }

          if (!teams[t.teamName]) {
            teams[t.teamName] = { score: 0, bonus: 0 };
          }
        });
      });

      Object.keys(teamTotals).forEach(team => {
        teamTotals[team] = {
          score: round.questions.reduce(
            (prev, curr) => prev + curr.teams.filter(t => t.teamName === team && t.isCorrect).length * CORRECT_ANSWER_MULTIPLIER,
            0
          ),
          bonus: round.questions.reduce((prev, curr) => prev + (curr.fastestAnswer === team ? 1 * FAST_BONUS_MULTIPLIER : 0), 0)
        };

        teams[team] = {
          score: teams[team].score + teamTotals[team].score,
          bonus: teams[team].bonus + teamTotals[team].bonus
        };
      });

      rounds[index].teamTotals = Object.keys(teamTotals).map(teamName => ({
        teamName,
        score: teamTotals[teamName].score,
        bonus: teamTotals[teamName].bonus
      }));
    });

    res.json({
      success: true,
      gameRoomName: gameRoomName,
      currentTeams: currentGame.teams,
      rounds: rounds,
      teams: Object.keys(teams).map(teamName => ({
        teamName,
        score: teams[teamName].score,
        bonus: teams[teamName].bonus,
        playerCode: getPlayerCode(teamName)
      }))
    });
  } else {
    res.json({
      success: false
    });
  }
}
