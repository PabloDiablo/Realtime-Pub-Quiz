import { HasSession, UnsucessfulResponse } from '../../types';
import { HasSessionResponse } from '../../../shared/types/player';
import { GameResponse } from '../../../shared/types/response';
import { getUrl, fetchJson } from '../../shared/services';

export function getHasSession(): Promise<HasSession | UnsucessfulResponse> {
  const url = getUrl('/api/session');

  return fetchJson<HasSessionResponse>(url, 'GET');
}

export function leaveGame(): Promise<GameResponse> {
  const url = getUrl('/api/team/leave-game');

  return fetchJson(url, 'POST');
}
