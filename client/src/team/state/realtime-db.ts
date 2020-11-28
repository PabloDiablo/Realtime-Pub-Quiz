import firebase from 'firebase/app';

import { Action, ActionTypes } from './context';
import { TeamStatus, GameStatus } from '../../../../types/status';
import { Question } from '../../types/state';

interface Settings {
  gameId: string;
  teamId: string;
}

interface QuestionData {
  question: string;
  questionId: string;
  image: string;
  category: string;
  type: 'text' | 'multi';
  possibleOptions: string;
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

  let gameDbIsConnected = false;
  let teamDbIsConnected = false;

  const dispatchIfConnected = () => {
    if (gameDbIsConnected && teamDbIsConnected) {
      dispatch({ type: ActionTypes.SetHasConnected });
    }
  };

  const formatQuestion = (question: QuestionData): Question => {
    if (!question) {
      return null;
    }

    return {
      question: question.question,
      questionId: question.questionId,
      image: question.image,
      category: question.category,
      type: question.type,
      possibleOptions: question.possibleOptions ? question.possibleOptions.split(',') : []
    };
  };

  gameDbRef.on('value', snap => {
    gameDbIsConnected = true;

    const val = snap.val() as GameData;

    dispatch({ type: ActionTypes.SetQuestion, question: formatQuestion(val.question) });
    dispatch({ type: ActionTypes.SetRound, round: val.round ?? null });
    dispatch({ type: ActionTypes.SetGameStatus, gameStatus: val.status });

    dispatchIfConnected();
  });

  teamDbRef.on('value', snap => {
    teamDbIsConnected = true;

    const val = snap.val() as TeamData | null;

    if (val) {
      dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: val.status });
      dispatch({ type: ActionTypes.SetTeamName, teamName: val.teamName });
    } else {
      dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: TeamStatus.Quit });
    }

    dispatchIfConnected();
  });
}
