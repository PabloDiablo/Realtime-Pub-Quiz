import { Collection, getRepository, ISubCollection, SubCollection } from 'fireorm';

export class Round {
  id: string;
  name: string;
  questions: string[];
}

@Collection()
export class GameConfig {
  id: string;
  gameRoom: string;
  quizMasterId: string;

  @SubCollection(Round)
  rounds?: ISubCollection<Round>;
}

export const getGameConfigRepository = () => getRepository(GameConfig);

export const createGameConfig = (data: GameConfig) => getGameConfigRepository().create(data);
