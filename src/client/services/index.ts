import { UnsucessfulResponse } from '../types';
import { httpHostname } from '../config';

export function getUrl(service: string): string {
  return `${httpHostname}${service}`;
}

export async function fetchJson<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, any>
): Promise<T | UnsucessfulResponse> {
  const options: RequestInit = {
    method,
    body: JSON.stringify(body) ?? null,
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
      console.log(`Request to ${url} returned code ${res.status}`);

      return Promise.resolve({ success: false });
    }
  } catch (err) {
    console.error(err);

    return Promise.resolve({ success: false });
  }
}
