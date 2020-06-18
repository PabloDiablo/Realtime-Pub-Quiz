import firebase from 'firebase/app';

import { Action, ActionTypes } from './context';
import { Team, Game } from '../types/state';

interface FirebaseTeam {
  accepted: boolean;
  teamName: string;
  teamId: string;
  gameRoom: string;
  playerCode: string;
}

export function openRealtimeDbConnection(dispatch: React.Dispatch<Action>): void {
  const db = firebase.database();
  const gameDbRef = db.ref('games');
  const teamDbRef = db.ref('teams');

  gameDbRef.on('value', snap => {
    dispatch({ type: ActionTypes.SetHasConnected });

    const val = snap.val();

    console.log(val);

    if (!val) {
      return;
    }

    const games: Game[] = val
      ? Object.entries(val as Record<string, Game>).map(([gameId, obj]) => ({
          id: gameId,
          name: gameId,
          status: obj.status,
          question: obj.question
        }))
      : [];

    dispatch({ type: ActionTypes.SetGames, games });
  });

  teamDbRef.on('value', snap => {
    const val = snap.val();
    console.log(val);

    const teams: Team[] = [];

    if (val) {
      Object.values(val as Record<string, Record<string, FirebaseTeam>>).forEach(game => {
        Object.entries(game).forEach(([rdbid, obj]) => {
          teams.push({
            rdbid,
            teamId: obj.teamId,
            teamName: obj.teamName,
            playerCode: obj.playerCode,
            accepted: obj.accepted,
            gameId: obj.gameRoom
          });
        });
      });
    }

    dispatch({ type: ActionTypes.SetTeams, teams });
  });
}
