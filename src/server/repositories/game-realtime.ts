import firebaseAdmin from 'firebase-admin';

import { GameStatus } from '../../shared/types/status';

interface QuestionData {
  question: string;
  questionId: string;
  image: string;
  category: string;
}

interface RoundData {
  name: string;
  id: string;
}

interface GameData {
  status: GameStatus;
  question: QuestionData | null;
  round: RoundData | null;
}

export const getGameRecord = (gameRoom: string) => firebaseAdmin.database().ref(`games/${gameRoom}`);

export const getGameValue = (gameRoom: string) => getGameRecord(gameRoom.toUpperCase()).once('value');

export const updateGameRealtime = (gameRoom: string, data: Partial<GameData>) => getGameRecord(gameRoom).update(data);

export const hasGame = async (gameRoom: string) => (await getGameRecord(gameRoom.toUpperCase()).once('value')).exists();
