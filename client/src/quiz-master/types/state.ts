import { GameStatus, TeamStatus } from '../../../../types/status';

export interface Team {
  teamId: string;
  teamName: string;
  playerCode: string;
  status: TeamStatus;
  gameId: string;
}

export interface Question {
  question: string;
  questionId: string;
  image?: string;
  category: string;
  type: 'text' | 'multi';
  possibleOptions: string[];
}

export interface RoundData {
  name: string;
  id: string;
  numOfQuestions: number;
  currentQuestionNumber: number;
}

export interface Game {
  id: string;
  name: string;
  status: GameStatus;
  question?: Question;
  round?: RoundData;
}

export interface State {
  isLoggedIn: boolean;
  hasConnected: boolean;
  games: Game[];
  teams: Team[];
  scores: ScoresList[];
}

export enum FastAnswerOptions {
  None = 'none',
  FastSingle = 'fastsingle',
  FastX = 'fastx',
  Sliding = 'sliding'
}

export interface TeamScore {
  teamId: string;
  playerCode: string;
  score: number;
  bonus: number;
  total: number;
  position: number;
}

interface RoundScore {
  name: string;
  id: string;
  scores: TeamScore[];
}

export interface ScoresList {
  gameId: string;
  leaderboard: TeamScore[];
  rounds: RoundScore[];
}
