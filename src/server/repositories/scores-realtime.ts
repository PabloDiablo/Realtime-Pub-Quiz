import firebaseAdmin from 'firebase-admin';

export interface TeamScore {
  teamId: string;
  playerCode: string;
  score: number;
  bonus: number;
}

interface RoundScore {
  name: string;
  id: string;
  scores: Record<string, TeamScore>;
}

interface ScoresData {
  leaderboard: Record<string, TeamScore>;
  rounds: Record<string, RoundScore>;
}

export const getScoresRecord = (gameId: string) => firebaseAdmin.database().ref(`scores/${gameId}`);

export const updateScoresRealtime = (gameId: string, data: Partial<ScoresData>) => getScoresRecord(gameId).update(data);
