import firebase from 'firebase/app';

import { Action, ActionTypes } from './context';
import { TeamStatus, GameStatus } from '../../../shared/types/status';

interface Settings {
  gameId: string;
  teamId: string;
}

interface QuestionData {
  question: string;
  questionId: string;
  image: string;
  category: string;
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

interface TeamData {
  status: TeamStatus;
  teamName: string;
  gameRoom: string;
  playerCode: string;
}

export function openRealtimeDbConnection({ gameId, teamId }: Settings, dispatch: React.Dispatch<Action>): void {
  const db = firebase.database();
  const gameDbRef = db.ref(`games/${gameId}`);
  const teamDbRef = db.ref(`teams/${gameId}/${teamId}`);

  gameDbRef.on('value', snap => {
    dispatch({ type: ActionTypes.SetHasConnected });

    const val = snap.val() as GameData;

    console.log(val);

    dispatch({ type: ActionTypes.SetQuestion, question: val.question ?? null });
    dispatch({ type: ActionTypes.SetRound, round: val.round ?? null });
    dispatch({ type: ActionTypes.SetGameStatus, gameStatus: val.status });
  });

  teamDbRef.on('value', snap => {
    const val = snap.val() as TeamData | null;
    console.log(val);

    if (val) {
      dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: val.status });
      dispatch({ type: ActionTypes.SetTeamName, teamName: val.teamName });
    } else {
      dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: TeamStatus.Quit });
    }
  });
}
