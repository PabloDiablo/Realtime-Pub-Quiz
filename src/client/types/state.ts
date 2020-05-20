import { GameStatus } from '../../shared/types/status';

export interface GameRoomTeam {
  _id: string;
  name: string;
  approved: boolean;
  playerCode: string;
}

export interface GameRoomTeamWithAnswer extends GameRoomTeam {
  teamAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export enum TeamStatus {
  New = 'new',
  Success = 'success',
  Deleted = 'deleted',
  Pending = 'pending',
  Error = 'error'
}

export interface Question {
  question: string;
  questionId: string;
  image?: string;
  category: string;
  maxQuestions: number;
}

export interface GameState {
  teamStatus: TeamStatus;
  gameStatus: GameStatus;
  question?: Question;
}
