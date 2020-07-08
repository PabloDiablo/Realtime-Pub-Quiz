import { Collection, getRepository } from 'fireorm';

@Collection()
export class TeamSession {
  id: string;
  gameId: string;
  teamId: string;
}

export const getTeamSessionRepository = () => getRepository(TeamSession);

export const createTeamSession = (data: TeamSession) => getTeamSessionRepository().create(data);
