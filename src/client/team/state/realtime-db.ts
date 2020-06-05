import firebase from 'firebase/app';

import { Action, ActionTypes } from './context';
import { TeamStatus } from '../../../shared/types/status';

interface Settings {
  gameRoom: string;
  rdbTeamId: string;
}

export function openRealtimeDbConnection({ gameRoom, rdbTeamId }: Settings, dispatch: React.Dispatch<Action>): void {
  const db = firebase.database();
  const gameDbRef = db.ref(`games/${gameRoom}`);
  const teamDbRef = db.ref(`teams/${gameRoom}/${rdbTeamId}`);

  gameDbRef.on('value', snap => {
    dispatch({ type: ActionTypes.SetHasConnected });

    const val = snap.val();

    console.log(val);

    if (val.question) {
      dispatch({ type: ActionTypes.SetQuestion, question: val.question });
    }

    dispatch({ type: ActionTypes.SetGameStatus, gameStatus: val.status });
  });

  teamDbRef.on('value', snap => {
    const val = snap.val();
    console.log(val);

    if (val) {
      dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: val.accepted ? TeamStatus.Success : TeamStatus.Pending });
      dispatch({ type: ActionTypes.SetTeamName, teamName: val.teamName });
    } else {
      dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: TeamStatus.Error });
    }
  });
}
