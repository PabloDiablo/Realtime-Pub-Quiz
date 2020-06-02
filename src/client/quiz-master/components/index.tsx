import React from 'react';

import ChooseCategories from './ChooseCategories';
import ChooseQuestion from './ChooseQuestion';
import MarkTeamAnswers from './MarkTeamAnswers';
import CreateGame from './CreateGame';
import Lobby from './Lobby';
import EndOfRound from './EndOfRound';
import LatePlayer from './LatePlayer';
import ControlBar from './ControlBar';

import { useStateContext } from '../state/context';
import { GameStatus } from '../../../shared/types/status';

const QuizMaster: React.FC = () => {
  const {
    state: { gameStatus, teams }
  } = useStateContext();

  const playersInQueue = gameStatus !== GameStatus.Lobby ? teams.filter(t => !t.accepted) : [];

  return (
    <>
      {playersInQueue.length > 0 && <LatePlayer team={playersInQueue[0]} />}
      {gameStatus === GameStatus.Lobby && <Lobby />}
      {gameStatus === GameStatus.ChooseCategory && <ChooseCategories />}
      {gameStatus === GameStatus.ChooseQuestion && <ChooseQuestion />}
      {(gameStatus === GameStatus.AskingQuestion || gameStatus === GameStatus.QuestionClosed) && <MarkTeamAnswers />}
      {gameStatus === GameStatus.RoundEnded && <EndOfRound />}
      {(gameStatus === GameStatus.EndGame || gameStatus === GameStatus.NotSet) && <CreateGame />}
      {gameStatus !== GameStatus.NotSet && <ControlBar />}
    </>
  );
};

export default QuizMaster;
