import { GameStatus, TeamStatus } from '../../../types/status';

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
  type: 'text' | 'multi';
  possibleOptions: string[];
  openedAt: number;
  timeToAnswer: number;
}

export interface GameState {
  hasConnected: boolean;
  teamStatus: TeamStatus;
  gameStatus: GameStatus;
  question?: Question;
  teamName?: string;
  round?: RoundData;
  score: number;
}

export interface RoundData {
  name: string;
  id: string;
  numOfQuestions: number;
  currentQuestionNumber: number;
}
