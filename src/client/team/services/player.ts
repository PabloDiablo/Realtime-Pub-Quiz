import {
  HasSessionResponse,
  LeaveGameResponse,
  SubmitAnswerRequest,
  SubmitAnwserResponse,
  JoinGameRequest,
  JoinGameResponse
} from '../../../shared/types/player';
import { getUrl, fetchJson } from '../../shared/services';

export function getHasSession(): Promise<HasSessionResponse> {
  const url = getUrl('/api/team/session');

  return fetchJson<HasSessionResponse>(url, 'GET');
}

export function postLeaveGame(): Promise<LeaveGameResponse> {
  const url = getUrl('/api/team/leave-game');

  return fetchJson<LeaveGameResponse>(url, 'POST');
}

export function postJoinGame(body: JoinGameRequest): Promise<JoinGameResponse> {
  const url = getUrl('/api/team/join');

  return fetchJson<JoinGameResponse>(url, 'POST', body);
}

export function postSubmitAnswer(body: SubmitAnswerRequest): Promise<SubmitAnwserResponse> {
  const url = getUrl('/api/team/submit-answer');

  return fetchJson<SubmitAnwserResponse>(url, 'POST', body);
}
