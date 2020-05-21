import { GameStatus, TeamStatus } from '../../shared/types/status';

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

export interface Question {
  question: string;
  questionId: string;
  image?: string;
  category: string;
}

export interface GameState {
  teamStatus: TeamStatus;
  gameStatus: GameStatus;
  question?: Question;
}
