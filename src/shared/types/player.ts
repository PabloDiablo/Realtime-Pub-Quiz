import { GameResponse } from './response';
import { GameStatus, TeamStatus } from './status';

export interface HasSessionResponse extends GameResponse {
  hasSession: boolean;
  gameStatus: GameStatus;
  teamStatus: TeamStatus;
  question?: {
    question: string;
    questionId: string;
    image?: string;
    category: string;
  };
}
