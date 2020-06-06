import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

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
import { openRealtimeDbConnection } from '../state/realtime-db';
import { getHasSession } from '../services/quiz-master';
import MessageBox from '../../shared/components/MessageBox';

const QuizMaster: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const {
    state: { hasConnected, gameStatus, teams },
    dispatch
  } = useStateContext();

  useEffect(() => {
    const hasSession = async () => {
      setIsLoading(true);
      const res = await getHasSession();

      if (res.success && res.hasSession) {
        openRealtimeDbConnection({ gameRoom: res.gameRoom }, dispatch);
      } else {
        setHasError(true);
      }

      setIsLoading(false);
    };

    hasSession();
  }, [dispatch]);

  const playersInQueue = gameStatus !== GameStatus.Lobby ? teams.filter(t => !t.accepted) : [];

  if (hasError) {
    return <MessageBox heading="Error">There was an error connecting to the game server</MessageBox>;
  }

  if (!hasConnected || isLoading) {
    return (
      <MessageBox heading="Loading...">
        <Spinner animation="border" />
      </MessageBox>
    );
  }

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
