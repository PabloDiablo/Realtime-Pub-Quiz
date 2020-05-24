import { GameResponse } from '../../shared/types/response';
import { getUrl, fetchJson } from '.';

export function postEndGame(): Promise<GameResponse> {
  const url = getUrl('/api/game/end-game');

  return fetchJson(url, 'POST', { gameStatus: 'end_game' });
}
