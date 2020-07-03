import firebaseAdmin from 'firebase-admin';

import { TeamStatus } from '../../shared/types/status';

interface TeamData {
  status: TeamStatus;
  teamName: string;
  gameRoom: string;
  playerCode: string;
}

interface TeamDataWithTeamId extends TeamData {
  teamId: string;
}

export const getAllTeamRecords = (gameRoom: string) => firebaseAdmin.database().ref(`teams/${gameRoom}`);

export const getTeamRecord = (gameRoom: string, teamId: string) => firebaseAdmin.database().ref(`teams/${gameRoom}/${teamId}`);

export const updateTeam = (gameRoom: string, teamId: string, data: Partial<TeamData>) => getTeamRecord(gameRoom, teamId).update(data);

export const createTeamRecord = (gameRoom: string, data: TeamData) =>
  firebaseAdmin
    .database()
    .ref(`teams/${gameRoom}`)
    .push(data);

export const hasTeam = async (gameRoom: string, teamName: string) => {
  const teamsSnapshot = await getAllTeamRecords(gameRoom).once('value');

  const val = teamsSnapshot.val() as Record<string, TeamData> | null;

  if (!val) {
    return false;
  }

  return Object.values(val).some(team => team.teamName.toUpperCase() === teamName.toUpperCase());
};

export const getTeamValue = async (gameId: string, teamId: string): Promise<TeamData> => (await getTeamRecord(gameId, teamId).once('value')).val();

export const getAllTeamsValue = async (gameId: string): Promise<TeamDataWithTeamId[]> => {
  const teamsSnapshot = await getAllTeamRecords(gameId).once('value');

  const val = teamsSnapshot.val() as Record<string, TeamData> | null;

  if (!val) {
    return [];
  }

  return Object.entries(val).map(([teamId, data]) => ({ ...data, teamId }));
};

export const getByPlayerCode = async (gameId: string, playerCode: string): Promise<TeamDataWithTeamId> => {
  const val = await getAllTeamsValue(gameId);

  return val.find(t => t.playerCode === playerCode);
};
