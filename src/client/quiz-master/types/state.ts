import { GameStatus } from '../../../shared/types/status';

export interface Team {
  rdbid: string;
  teamId: string;
  teamName: string;
  playerCode: string;
  accepted: boolean;
}

export interface State {
  gameStatus: GameStatus;
  gameRoom: string;
  questionId: string;
  teams: Team[];
}
