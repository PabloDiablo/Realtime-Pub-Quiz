import { Collection, getRepository } from 'fireorm';

@Collection()
export class TeamAnswer {
  id: string;
  gameId: string;
  questionId: string;
  teamId: string;
  timestamp: number;
  answer: string;
  isCorrect?: boolean;
}

export const getTeamAnswerRepository = () => getRepository(TeamAnswer);

export const createTeamAnswer = (data: TeamAnswer) => getTeamAnswerRepository().create(data);
