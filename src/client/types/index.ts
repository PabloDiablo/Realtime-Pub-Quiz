import { ScoresResponse } from '../../shared/types/scores';
import { HasSessionResponse } from '../../shared/types/player';

export interface UnsucessfulResponse {
  success: false;
}

export interface Scores extends Omit<ScoresResponse, 'success'> {
  success: true;
}

export interface HasSession extends Omit<HasSessionResponse, 'success'> {
  success: true;
}
