import { GameStatus, TeamStatus } from '../../../shared/types/status';

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
}

export enum FastAnswerOptions {
  None = 'none',
  FastSingle = 'fastsingle',
  FastX = 'fastx',
  Sliding = 'sliding'
}
