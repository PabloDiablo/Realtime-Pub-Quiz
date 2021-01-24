import { Collection, getRepository } from 'fireorm';

@Collection()
export class QuizMasterSession {
  id: string;
}

export const getQuizMasterSessionRepository = () => getRepository(QuizMasterSession);

export const createQuizMasterSession = (data: QuizMasterSession) => getQuizMasterSessionRepository().create(data);
