import { getUrl, fetchJson } from '../../shared/services';
import { LoginResponse, HasSessionResponse } from '../../../shared/types/quizMaster';

export function postLogin(passcode: string): Promise<LoginResponse> {
  const url = getUrl('/api/quiz-master/login');

  return fetchJson<LoginResponse>(url, 'POST', { passcode });
}

export function getHasSession(): Promise<HasSessionResponse> {
  const url = getUrl('/api/quiz-master/session');

  return fetchJson<HasSessionResponse>(url, 'GET');
}
