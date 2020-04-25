import { ScoresResponse } from '../../shared/types/scores';

export interface UnsucessfulResponse {
  success: false;
}

export interface Scores extends Omit<ScoresResponse, 'success'> {
  success: true;
}
