import { CategoriesResponse, QuestionsResponse, QuestionAnswersResponse, NewGameResponse, MarkAnswerResponse } from '../../../shared/types/quizMaster';

export interface Categories extends Omit<CategoriesResponse, 'success'> {
  success: true;
}

export interface Questions extends Omit<QuestionsResponse, 'success'> {
  success: true;
}

export interface QuestionAnswers extends Omit<QuestionAnswersResponse, 'success'> {
  success: true;
}

export interface NewGame extends Omit<NewGameResponse, 'success'> {
  success: true;
}

export interface MarkAnswer extends Omit<MarkAnswerResponse, 'success'> {
  success: true;
}
