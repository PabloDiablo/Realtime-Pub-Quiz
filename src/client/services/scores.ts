import { Scores, UnsucessfulResponse } from '../types';
import { ScoresResponse } from '../../shared/types/scores';
import { getUrl, fetchJson } from '.';

export function getScores(gameRoomName: string): Promise<Scores | UnsucessfulResponse> {
  const url = getUrl(`/api/games/${gameRoomName}/scoreboard`);

  return fetchJson<ScoresResponse>(url, 'GET');
}
