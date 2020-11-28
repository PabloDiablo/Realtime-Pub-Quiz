import { BadResponse, OkResponse } from './response';
import { JoinGameErrorReason, SubmitAnswerErrorReason } from './enum';

interface HasSessionResponseBase extends OkResponse {
  hasSession: boolean;
  gameRoom: string;
  teamId: string;
}

export type HasSessionResponse = HasSessionResponseBase | BadResponse;

export type LeaveGameResponse = OkResponse | BadResponse;

export interface JoinGameRequest {
  gameRoom: string;
  playerCode: string;
  teamName: string;
}

interface JoinGameResponseBase extends OkResponse {
  errorReason: JoinGameErrorReason;
  teamId?: string;
  gameRoom?: string;
}

export type JoinGameResponse = JoinGameResponseBase | BadResponse;

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
}

interface SubmitAnswerResponseBase extends OkResponse {
  errorReason: SubmitAnswerErrorReason;
}

export type SubmitAnwserResponse = SubmitAnswerResponseBase | BadResponse;
