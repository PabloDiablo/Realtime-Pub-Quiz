import { getUrl, fetchJson } from '../../shared/services';
import { LoginResponse, HasSessionResponse } from '../../../../types/quizMaster';

export function postLogin(passcode: string): Promise<LoginResponse> {
  const url = getUrl('/api/quiz-master/login');

  return fetchJson<LoginResponse>(url, 'POST', { passcode });
}

export function getHasSession(): Promise<HasSessionResponse> {
  const url = getUrl('/api/quiz-master/session');

  return fetchJson<HasSessionResponse>(url, 'GET');
}
