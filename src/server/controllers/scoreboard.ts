import { Request, Response } from 'express';

import Games, { GamesSchema } from '../database/model/games';
import config from '../config';

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
interface TeamScore {
  teamName: string;
  score: number;
  bonus: number;
  playerCode: string;
}

interface ParsedGameRoom {
  rounds: Record<number, LocalRound>;
  teams: TeamScore[];
}

const CORRECT_ANSWER_MULTIPLIER = 10;
const FAST_BONUS_MULTIPLIER = 5;

function parseScoresFromGameRoom(currentGame: GamesSchema): ParsedGameRoom {
  const getPlayerCode = (teamName: string) => currentGame.teams.find(t => t._id === teamName)?.playerCode;

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
        score: round.questions.reduce((prev, curr) => prev + curr.teams.filter(t => t.teamName === team && t.isCorrect).length * CORRECT_ANSWER_MULTIPLIER, 0),
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

  return {
    rounds: rounds,
    teams: Object.keys(teams).map(teamName => ({
      teamName,
      score: teams[teamName].score,
      bonus: teams[teamName].bonus,
      playerCode: getPlayerCode(teamName)
    }))
  };
}

const combineGames = (games: ParsedGameRoom[]): ParsedGameRoom => {
  // rounds

  // teams
  const teams: Record<string, TeamScore> = {};

  games.forEach(game => {
    game.teams.forEach(team => {
      const playerCode = team.playerCode?.toUpperCase().trim();

      if (!teams[playerCode]) {
        teams[playerCode] = team;
      } else {
        teams[playerCode].score = teams[playerCode].score + team.score;
        teams[playerCode].bonus = teams[playerCode].bonus + team.bonus;
      }
    });
  });

  return {
    rounds: games[0].rounds,
    teams: Object.keys(teams).map(playerCode => ({
      teamName: teams[playerCode].teamName,
      score: teams[playerCode].score,
      bonus: teams[playerCode].bonus,
      playerCode
    }))
  };
};

export async function getScores(req: Request, res: Response) {
  const passcode = req.params.passcode;

  if (!req.params.gameRoom || (config.QM_PASS && passcode !== config.QM_PASS)) {
    res.json({
      success: false
    });

    return;
  }

  const gameRoomNames = req.params.gameRoom.split(',').filter(x => typeof x === 'string' && Boolean(x));

  if (gameRoomNames.length === 0 || gameRoomNames.length > 4) {
    res.json({
      success: false
    });

    return;
  }

  try {
    const gameObjects = await Promise.all(gameRoomNames.map(id => Games.findOne({ _id: id })));

    const parsedGames = gameObjects.map(game => parseScoresFromGameRoom(game));

    const { rounds, teams } = combineGames(parsedGames);

    res.json({
      success: true,
      rounds,
      teams
    });
  } catch (err) {
    res.json({
      success: false
    });
  }
}
