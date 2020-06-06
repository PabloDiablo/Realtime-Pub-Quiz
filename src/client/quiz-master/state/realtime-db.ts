import firebase from 'firebase/app';

import { Action, ActionTypes } from './context';
import { Team } from '../types/state';

interface Settings {
  gameRoom: string;
}

interface FirebaseTeam {
  accepted: boolean;
  teamName: string;
  teamId: string;
  gameRoom: string;
  playerCode: string;
}

export function openRealtimeDbConnection({ gameRoom }: Settings, dispatch: React.Dispatch<Action>): void {
  const db = firebase.database();
  const gameDbRef = db.ref(`games/${gameRoom}`);
  const teamDbRef = db.ref(`teams/${gameRoom}`);

  gameDbRef.on('value', snap => {
    dispatch({ type: ActionTypes.SetHasConnected });

    const val = snap.val();

    console.log(val);

    if (!val) {
      return;
    }

    if (val.question) {
      dispatch({ type: ActionTypes.SetQuestionId, questionId: val.question.questionId });
    }

    dispatch({ type: ActionTypes.SetGameStatus, gameStatus: val.status });
  });

  teamDbRef.on('value', snap => {
    const val = snap.val();
    console.log(val);

    const teams: Team[] = val
      ? Object.entries(val as Record<string, FirebaseTeam>).map(([rdbid, obj]) => ({
          rdbid,
          teamId: obj.teamId,
          teamName: obj.teamName,
          playerCode: obj.playerCode,
          accepted: obj.accepted
        }))
      : [];

    dispatch({ type: ActionTypes.SetTeams, teams });
  });
}
