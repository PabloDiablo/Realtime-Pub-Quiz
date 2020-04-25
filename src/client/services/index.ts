import { ScoresResponse } from '../../shared/types/scores';
import { UnsucessfulResponse, Scores } from '../types';

async function fetchJson<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };

  try {
    const res = await fetch(url, options);
    return res.json() as Promise<T>;
  } catch (err) {
    console.error(err);

    return Promise.reject(err);
  }
}

export function getScores(gameRoomName: string): Promise<Scores | UnsucessfulResponse> {
  const url = `/api/games/${gameRoomName}/scoreboard`;

  return fetchJson<ScoresResponse>(url, 'GET');
}
