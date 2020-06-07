import { Collection, getRepository } from 'fireorm';

@Collection()
export class GameConfig {
  id: string;
  gameRoom: string;
  quizMasterId: string;
}

export const getGameConfigRepository = () => getRepository(GameConfig);

export const createGameConfig = (data: GameConfig) => getGameConfigRepository().create(data);
