import { GameResponse } from '../../../shared/types/response';
import { getUrl, fetchJson } from '../../shared/services';
import { CategoriesResponse, QuestionsResponse, QuestionAnswersResponse, NewGameResponse, MarkAnswerResponse } from '../../../shared/types/quizMaster';
import { UnsucessfulResponse } from '../../types';
import { Categories, Questions, QuestionAnswers, NewGame, MarkAnswer } from '../types/response';

export function postEndGame(): Promise<GameResponse> {
  const url = getUrl('/api/game/end-game');

  return fetchJson(url, 'POST', { gameStatus: 'end_game' });
}

export function getCategories(): Promise<Categories | UnsucessfulResponse> {
  const url = getUrl('/api/questions/categories');

  return fetchJson<CategoriesResponse>(url, 'GET');
}

export function getQuestionsInRound(): Promise<Questions | UnsucessfulResponse> {
  const url = getUrl('/api/game/0/ronde/0/questions');

  return fetchJson<QuestionsResponse>(url, 'GET');
}

export function getQuestionAnswers(questionId: string): Promise<QuestionAnswers | UnsucessfulResponse> {
  const url = getUrl(`/api/game/0/ronde/0/question/${questionId}/answers`);

  return fetchJson<QuestionAnswersResponse>(url, 'GET');
}

export function postNewGame(gameRoomName: string, passcode: string): Promise<NewGame | UnsucessfulResponse> {
  const url = getUrl('/api/game');

  return fetchJson<NewGameResponse>(url, 'POST', { gameRoomName, passcode });
}

export function postMarkAnswer(teamId: string, questionId: string, isCorrect: boolean): Promise<MarkAnswer | UnsucessfulResponse> {
  const url = getUrl('/api/game/mark-answer');

  return fetchJson<MarkAnswerResponse>(url, 'POST', {
    teamId,
    questionId,
    isCorrect
  });
}
