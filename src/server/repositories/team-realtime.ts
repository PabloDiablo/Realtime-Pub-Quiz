import firebaseAdmin from 'firebase-admin';

interface TeamData {
  status: 'waiting' | 'joined' | 'blocked';
  teamName: string;
  gameRoom: string;
  playerCode: string;
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

  const val = teamsSnapshot.val() as Record<string, TeamData>;

  return Object.values(val).some(team => team.teamName.toUpperCase() === teamName.toUpperCase());
};

export const findTeamInAllGameRooms = async (teamId: string) => {
  const db = await firebaseAdmin
    .database()
    .ref('teams')
    .once('value');

  const teamGroups = db.val() as Record<string, Record<string, TeamData>>;

  const team = Object.values(teamGroups).find(group => Object.keys(group).some(key => key === teamId));

  if (team && team[teamId]) {
    return team[teamId];
  }
};
