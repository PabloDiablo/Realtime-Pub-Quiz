import { Request, Response } from 'express';
import { MongooseDocument } from 'mongoose';

import Rounds, { RoundSchema } from '../database/model/rounds';
import Questions, { QuestionSchema } from '../database/model/questions';
import TeamAnswers, { TeamAnswerSchema } from '../database/model/teamAnswer';
import { TeamSchema } from '../database/model/teams';
import config from '../config';

type Lean<T> = T & Pick<MongooseDocument, '_id'>;

interface TeamAnswerResult extends Omit<Lean<TeamAnswerSchema>, 'team'> {
  team: Lean<TeamSchema>;
}

interface LocalRound {
  questionsCount: number;
  category: string;
  questions: {
    question: string;
    answer: string;
    fastestAnswer: string;
    teams: {
      teamName: string;
      playerCode: string;
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

function parseScoresFromGameRoom(rounds: Lean<RoundSchema>[], questions: Lean<QuestionSchema>[], teamAnswers: TeamAnswerResult[]): ParsedGameRoom {
  const roundsMap: Record<number, LocalRound> = {};
  const teams: Record<string, TeamScore> = {};

  rounds.forEach((round, index) => {
    const questionsInRound = questions.filter(q => String(q.round) === String(round._id));

    roundsMap[index] = {
      questionsCount: questionsInRound.length,
      category: round.categories[0],
      questions: questionsInRound.map(q => {
        const teamAnswersInQuestion = teamAnswers.filter(t => String(t.question) === String(q._id));

        return {
          question: q.vraag,
          answer: q.antwoord,
          fastestAnswer: '',
          teams: teamAnswersInQuestion.map(a => ({
            teamName: a.team.name,
            playerCode: a.team.playerCode,
            answer: a.gegeven_antwoord,
            isCorrect: a.correct,
            timestamp: a.timestamp
          }))
        };
      }),
      teamTotals: []
    };
  });

  Object.values(roundsMap).forEach((round, index) => {
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
          teams[t.teamName] = { score: 0, bonus: 0, teamName: t.teamName, playerCode: t.playerCode };
        }
      });
    });

    Object.keys(teamTotals).forEach(team => {
      teamTotals[team] = {
        score: round.questions.reduce((prev, curr) => prev + curr.teams.filter(t => t.teamName === team && t.isCorrect).length * CORRECT_ANSWER_MULTIPLIER, 0),
        bonus: round.questions.reduce((prev, curr) => prev + (curr.fastestAnswer === team ? 1 * FAST_BONUS_MULTIPLIER : 0), 0)
      };

      teams[team] = {
        ...teams[team],
        score: teams[team].score + teamTotals[team].score,
        bonus: teams[team].bonus + teamTotals[team].bonus
      };
    });

    roundsMap[index].teamTotals = Object.keys(teamTotals).map(teamName => ({
      teamName,
      score: teamTotals[teamName].score,
      bonus: teamTotals[teamName].bonus
    }));
  });

  return {
    rounds: roundsMap,
    teams: Object.keys(teams).map(teamName => ({
      teamName,
      score: teams[teamName].score,
      bonus: teams[teamName].bonus,
      playerCode: teams[teamName].playerCode
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

async function getGameRoomScores(gameRoom: string) {
  // get rounds where gameRoom
  const rounds = await Rounds.find({ gameRoom }).lean();
  const roundIds = rounds.map(r => r._id);

  if (rounds.length === 0) {
    return undefined;
  }

  // get questions in each round
  const questions = await Questions.find({ round: { $in: roundIds } }).lean();
  const questionIds = questions.map(q => q._id);

  // get team answers for each question
  const teamAnswers: TeamAnswerResult[] = await TeamAnswers.find({ question: { $in: questionIds } })
    .populate('team')
    .lean();

  return parseScoresFromGameRoom(rounds, questions, teamAnswers);
}

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
    const gameObjects = await Promise.all(gameRoomNames.map(getGameRoomScores));

    if (gameObjects.length === 0) {
      res.json({
        success: false
      });

      return;
    }

    const { rounds, teams } = combineGames(gameObjects);

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
