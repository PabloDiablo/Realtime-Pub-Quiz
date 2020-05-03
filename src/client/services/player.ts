import { HasSession, UnsucessfulResponse } from '../types';
import { HasSessionResponse } from '../../shared/types/player';
import { getUrl, fetchJson } from '.';

export function getHasSession(): Promise<HasSession | UnsucessfulResponse> {
  const url = getUrl('/api/session');

  return fetchJson<HasSessionResponse>(url, 'GET');
}
