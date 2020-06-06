import { GameResponse } from './response';
import { GameStatus, TeamStatus } from './status';

export interface HasSessionResponse extends GameResponse {
  hasSession: boolean;
  gameRoom: string;
  gameStatus: GameStatus;
  teamStatus: TeamStatus;
  teamName?: string;
  rdbTeamId: string;
}
