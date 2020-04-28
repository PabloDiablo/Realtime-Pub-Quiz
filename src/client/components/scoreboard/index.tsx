import React, { useState, useEffect } from 'react';
import { Spinner, Button } from 'react-bootstrap';

import { getScores } from '../../services/scores';
import { Scores } from '../../types';
import EnterGameRoomName from './EnterGameRoomName';
import MessageBox from '../MessageBox';
import ScoresTable from './ScoresTable';

import '../../App.css';

const getGameRoomFromPath = () => {
  const [, , gameRoomFromPath] = window.location.pathname.split('/');

  return gameRoomFromPath || '';
};

const Scoreboard = () => {
  const [gameRoom, setGameRoom] = useState(getGameRoomFromPath());
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<Scores>();

  useEffect(() => {
    const fetchScores = async (room: string) => {
      setIsLoading(true);

      const data = await getScores(room);

      setIsLoading(false);

      if (data.success) {
        setData(data);

        window.history.replaceState(undefined, '', `/scoreboard/${room}`);
      } else {
        setHasError(true);
      }
    };

    if (gameRoom) {
      fetchScores(gameRoom);
    }
  }, [gameRoom]);

  const resetGameRoom = () => {
    setGameRoom('');
    setHasError(false);
    setData(undefined);
  };

  if (isLoading) {
    return (
      <MessageBox heading="Loading...">
        <Spinner animation="border" />
      </MessageBox>
    );
  }

  if (hasError) {
    return (
      <MessageBox heading="Error">
        There was an error. Likely the game room you entered doesn't exist.
        <div>
          <Button onClick={resetGameRoom}>Try again</Button>
        </div>
      </MessageBox>
    );
  }

  if (!gameRoom) {
    return <EnterGameRoomName setGameRoomName={setGameRoom} />;
  }

  if (data) {
    return <ScoresTable rounds={data.rounds} teams={data.teams} />;
  }

  return <div />;
};

export default Scoreboard;
