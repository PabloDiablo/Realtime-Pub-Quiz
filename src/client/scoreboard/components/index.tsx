import React, { useState, useEffect } from 'react';
import { Spinner, Button } from 'react-bootstrap';

import { getScores } from '../services/scores';
import { Scores } from '../../types';
import EnterGameRoomName from './EnterGameRoomName';
import MessageBox from '../../shared/components/MessageBox';
import ScoresTable from './ScoresTable';

const Scoreboard = () => {
  const [, , gameRoomFromPath, passcodeFromPath] = window.location.pathname.split('/');

  const [gameRoom, setGameRoom] = useState(gameRoomFromPath || '');
  const [passcode, setPasscode] = useState(passcodeFromPath || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<Scores>();

  useEffect(() => {
    const fetchScores = async (room: string, pass: string) => {
      setIsLoading(true);

      const data = await getScores(room, pass);

      setIsLoading(false);

      if (data.success) {
        setData(data);

        window.history.replaceState(undefined, '', `/scoreboard/${room}/${pass}`);
      } else {
        setHasError(true);
      }
    };

    if (gameRoom) {
      fetchScores(gameRoom, passcode);
    }
  }, [gameRoom, passcode]);

  const resetGameRoom = () => {
    setGameRoom('');
    setPasscode('');
    setHasError(false);
    setData(undefined);
    window.history.replaceState(undefined, '', '/scoreboard');
  };

  const setAccessData = (gameRoomData: string, passcodeData: string) => {
    setGameRoom(gameRoomData);
    setPasscode(passcodeData);
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
    return <EnterGameRoomName setData={setAccessData} />;
  }

  if (data) {
    return <ScoresTable rounds={data.rounds} teams={data.teams} />;
  }

  return <div />;
};

export default Scoreboard;
