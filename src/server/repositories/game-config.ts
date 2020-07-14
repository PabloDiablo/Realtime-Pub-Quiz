import { Collection, getRepository, ISubCollection, SubCollection } from 'fireorm';

export class Round {
  id: string;
  name: string;
  questions: string[];
  order: number;
}

@Collection()
export class GameConfig {
  id: string;
  gameRoom: string;
  correctPoints: number;
  randomPrizePosition: number;
  fastAnswerMethod: 'none' | 'fastsingle' | 'fastx' | 'sliding';
  bonusPoints: number;
  bonusNumTeams: number;
  authorisedPlayerCodes: string[];

  @SubCollection(Round)
  rounds?: ISubCollection<Round>;
}

export const getGameConfigRepository = () => getRepository(GameConfig);

export const createGameConfig = (data: GameConfig) => getGameConfigRepository().create(data);

export const getByGameRoom = (gameRoom: string) =>
  getGameConfigRepository()
    .whereEqualTo('gameRoom', gameRoom)
    .findOne();
