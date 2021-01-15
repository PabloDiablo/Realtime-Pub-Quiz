import { httpHostname } from '../../config';
import { BadResponse } from '../../../../types/response';
import { getAnalytics } from '../helpers/analytics';

export function getUrl(service: string): string {
  return `${httpHostname}${service}`;
}

export async function fetchJson<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: Record<string, any>): Promise<T | BadResponse> {
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

      getAnalytics().logEvent('submit_answer_http_error', {
        status: res.status,
        requestBody: JSON.stringify(body) ?? null
      });

      return Promise.resolve({ success: false });
    }
  } catch (err) {
    console.error(err);

    getAnalytics().logEvent('submit_answer_fetch_error', {
      error: err.message,
      requestBody: JSON.stringify(body) ?? null
    });

    return Promise.resolve({ success: false });
  }
}
