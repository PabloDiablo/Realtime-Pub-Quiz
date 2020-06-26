import { GameStatus } from '../../../shared/types/status';

export interface Team {
  rdbid: string;
  teamId: string;
  teamName: string;
  playerCode: string;
  accepted: boolean;
  gameId: string;
}

export interface Question {
  question: string;
  questionId: string;
  image?: string;
  category: string;
}

export interface Game {
  id: string;
  name: string;
  status: GameStatus;
  question?: Question;
}

export interface State {
  isLoggedIn: boolean;
  hasConnected: boolean;
  games: Game[];
  gameRoom: string;
  questionId: string;
  teams: Team[];
}

export enum FastAnswerOptions {
  None = 'none',
  FastSingle = 'fastsingle',
  FastX = 'fastx',
  Sliding = 'sliding'
}
