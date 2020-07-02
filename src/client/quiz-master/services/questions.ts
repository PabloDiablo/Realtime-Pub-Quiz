import { getUrl, fetchJson } from '../../shared/services';
import {
  AvailableQuestionsResponse,
  EditQuestionRequest,
  EditQuestionResponse,
  CreateQuestionRequest,
  CreateQuestionResponse
} from '../../../shared/types/quizMaster';

export function getAvailableQuestions(): Promise<AvailableQuestionsResponse> {
  const url = getUrl('/api/quiz-master/available-questions');

  return fetchJson<AvailableQuestionsResponse>(url, 'GET');
}

export function postCreateQuestion(body: CreateQuestionRequest): Promise<CreateQuestionResponse> {
  const url = getUrl('/api/quiz-master/create-question');

  return fetchJson<CreateQuestionResponse>(url, 'POST', body);
}

export function postEditQuestion(body: EditQuestionRequest): Promise<EditQuestionResponse> {
  const url = getUrl('/api/quiz-master/edit-question');

  return fetchJson<EditQuestionResponse>(url, 'POST', body);
}
