import { getUrl, fetchJson } from '../../shared/services';
import {
  CreateGameResponse,
  CreateGameRequest,
  GameInfoResponse,
  GameSettingsResponse,
  GamePlayerCodesResponse,
  GameRoundsResponse,
  GameSettingsRequest,
  GameRoundsRequest,
  GamePlayerCodesRequest,
  GetRoundsAndQuestionsInGameResponse,
  NextActionResponse,
  TeamStatusRequest,
  TeamStatusResponse,
  GetAllAnswersForQuestionResponse,
  SetAnswerStateRequest,
  SetAnswerStateResponse
} from '../../../shared/types/quizMaster';

export function postCreateGame(body: CreateGameRequest): Promise<CreateGameResponse> {
  const url = getUrl('/api/quiz-master/create-game');

  return fetchJson<CreateGameResponse>(url, 'POST', body);
}

export function getGameInfo(gameRoom: string): Promise<GameInfoResponse> {
  const url = getUrl(`/api/quiz-master/game-info/${gameRoom}`);

  return fetchJson<GameInfoResponse>(url, 'GET');
}

export function postTeamStatus(body: TeamStatusRequest): Promise<TeamStatusResponse> {
  const url = getUrl('/api/quiz-master/set-team-status');

  return fetchJson<TeamStatusResponse>(url, 'POST', body);
}

export function postGameSettings(body: GameSettingsRequest): Promise<GameSettingsResponse> {
  const url = getUrl('/api/quiz-master/edit-game/settings');

  return fetchJson<GameSettingsResponse>(url, 'POST', body);
}

export function postGamePlayerCodes(body: GamePlayerCodesRequest): Promise<GamePlayerCodesResponse> {
  const url = getUrl('/api/quiz-master/edit-game/player-codes');

  return fetchJson<GamePlayerCodesResponse>(url, 'POST', body);
}

export function postGameRounds(body: GameRoundsRequest): Promise<GameRoundsResponse> {
  const url = getUrl('/api/quiz-master/edit-game/rounds');

  return fetchJson<GameRoundsResponse>(url, 'POST', body);
}

export function getRoundsAndQuestionsInGame(gameRoom: string): Promise<GetRoundsAndQuestionsInGameResponse> {
  const url = getUrl(`/api/quiz-master/get-rounds-and-questions/${gameRoom}`);

  return fetchJson<GetRoundsAndQuestionsInGameResponse>(url, 'GET');
}

export function postNextAction(gameRoom: string): Promise<NextActionResponse> {
  const url = getUrl(`/api/quiz-master/next-action`);

  return fetchJson<NextActionResponse>(url, 'POST', { gameRoom });
}

export function getAllAnswersForQuestion(gameRoom: string, questionId: string): Promise<GetAllAnswersForQuestionResponse> {
  const url = getUrl(`/api/quiz-master/${gameRoom}/${questionId}`);

  return fetchJson<GetAllAnswersForQuestionResponse>(url, 'GET');
}

export function postSetAnswerState(body: SetAnswerStateRequest): Promise<SetAnswerStateResponse> {
  const url = getUrl('/api/quiz-master/mark-answer');

  return fetchJson<SetAnswerStateResponse>(url, 'POST', body);
}
