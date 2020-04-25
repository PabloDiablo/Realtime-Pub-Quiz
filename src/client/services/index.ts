import { ScoresResponse } from '../../shared/types/scores';
import { UnsucessfulResponse, Scores } from '../types';
import { httpHostname } from '../config';

function getUrl(service: string): string {
  // return `${httpHostname}${service}`;
  return `https://quiz.paulcrane.eu/api${service}`;
}

async function fetchJson<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T | UnsucessfulResponse> {
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

    if (res.ok) {
      return res.json() as Promise<T>;
    } else {
      return Promise.resolve({ success: false });
    }
  } catch (err) {
    console.error(err);

    return Promise.resolve({ success: false });
  }
}

export function getScores(gameRoomName: string): Promise<Scores | UnsucessfulResponse> {
  const url = getUrl(`/api/games/${gameRoomName}/scoreboard`);

  return fetchJson<ScoresResponse>(url, 'GET');
}
