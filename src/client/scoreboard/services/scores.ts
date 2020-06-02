import { Scores, UnsucessfulResponse } from '../../types';
import { ScoresResponse } from '../../../shared/types/scores';
import { getUrl, fetchJson } from '../../shared/services';

export function getScores(gameRoomName: string, passcode: string): Promise<Scores | UnsucessfulResponse> {
  const url = getUrl(`/api/games/${gameRoomName}/scoreboard/${passcode}`);

  return fetchJson<ScoresResponse>(url, 'GET');
}
