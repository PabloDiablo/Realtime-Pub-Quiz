import { getUrl, fetchJson } from '../../shared/services';
import { CreateGameResponse, CreateGameRequest } from '../../../shared/types/quizMaster';

export function postCreateGame(body: CreateGameRequest): Promise<CreateGameResponse> {
  const url = getUrl('/api/quiz-master/create-game');

  return fetchJson<CreateGameResponse>(url, 'POST', body);
}
