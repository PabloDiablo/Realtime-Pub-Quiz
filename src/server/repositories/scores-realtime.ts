import firebaseAdmin from 'firebase-admin';

export interface TeamScore {
  teamId: string;
  playerCode: string;
  score: number;
  bonus: number;
}

export interface RoundScore {
  name: string;
  id: string;
  scores: Record<string, TeamScore>;
}

interface ScoresData {
  leaderboard: Record<string, TeamScore>;
  rounds: Record<string, RoundScore>;
}

export const getScoresRecord = (gameId: string) => firebaseAdmin.database().ref(`scores/${gameId}`);
export const getRoundScoresRecord = (gameId: string, roundId: string) => firebaseAdmin.database().ref(`scores/${gameId}/rounds/${roundId}`);

export const updateScoresRealtime = (gameId: string, data: Partial<ScoresData>) => getScoresRecord(gameId).update(data);
export const updateRoundsScores = (gameId: string, roundId: string, data: RoundScore) => getRoundScoresRecord(gameId, roundId).update(data);

export const getScores = async (gameId: string): Promise<ScoresData> => (await getScoresRecord(gameId).once('value')).val() as ScoresData;

export const getRoundScores = async (gameId: string, roundId: string): Promise<RoundScore> =>
  (await getRoundScoresRecord(gameId, roundId).once('value')).val() as RoundScore;
