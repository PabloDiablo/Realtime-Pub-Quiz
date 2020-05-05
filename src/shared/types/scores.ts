import { GameResponse } from './response';

export interface ScoresResponse extends GameResponse {
  gameRoomName: string;
  teams: TeamTotalsOverall[];
  rounds: Record<number, RoundScore>;
}

interface TeamScore {
  teamName: string;
  answer: string;
  isCorrect?: boolean;
  timestamp: number;
}

interface QuestionScore {
  question: string;
  answer: string;
  fastestAnswer: string;
  teams: TeamScore[];
}

interface TeamTotals {
  teamName: string;
  score: number;
  bonus: number;
}

interface TeamTotalsOverall extends TeamTotals {
  playerCode: string;
}

interface RoundScore {
  category: string;
  questionsCount: number;
  teamTotals: TeamTotals[];
  questions: QuestionScore[];
}
