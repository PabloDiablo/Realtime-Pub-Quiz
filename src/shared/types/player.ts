import { GameResponse } from './response';

export interface HasSessionResponse extends GameResponse {
  hasSession: boolean;
}
