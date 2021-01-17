import firebaseAdmin from 'firebase-admin';

import { GameStatus } from '../../../types/status';

interface QuestionData {
  question: string;
  questionId: string;
  image: string;
  category: string;
  type: 'text' | 'multi';
  possibleOptions: string | null;
  timeToAnswer: number;
  openedAt: number;
}

interface RoundData {
  name: string;
  id: string;
  numOfQuestions: number;
  currentQuestionNumber: number;
}

interface GameData {
  status: GameStatus;
  question: QuestionData | null;
  round: RoundData | null;
}

export const getGameRecord = (gameRoom: string) => firebaseAdmin.database().ref(`games/${gameRoom}`);

export const getGameValue = async (gameRoom: string): Promise<GameData> => (await getGameRecord(gameRoom.toUpperCase()).once('value')).val();

export const updateGameRealtime = (gameRoom: string, data: Partial<GameData>) => getGameRecord(gameRoom).update(data);

export const hasGame = async (gameRoom: string) => (await getGameRecord(gameRoom.toUpperCase()).once('value')).exists();
