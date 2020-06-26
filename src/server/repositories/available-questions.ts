import { Collection, getRepository } from 'fireorm';

@Collection()
class AvailableQuestions {
  id: string;
  type: 'text' | 'multi';
  question: string;
  image?: string;
  answer: string | string[];
  category: string;
}

export const getAvailableQuestionsRepository = () => getRepository(AvailableQuestions);

export const createAvailableQuestion = (data: AvailableQuestions) => getAvailableQuestionsRepository().create(data);
