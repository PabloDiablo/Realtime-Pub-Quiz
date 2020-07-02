import { Collection, getRepository } from 'fireorm';

@Collection()
export class AvailableQuestion {
  id: string;
  type: 'text' | 'multi';
  text: string;
  image?: string;
  answer: string;
  category: string;
  possibleOptions?: string[];
}

export const getAvailableQuestionsRepository = () => getRepository(AvailableQuestion);

export const createAvailableQuestion = (data: AvailableQuestion) => getAvailableQuestionsRepository().create(data);
