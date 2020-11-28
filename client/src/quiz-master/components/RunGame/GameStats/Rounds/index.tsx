import React from 'react';
import { List } from '@material-ui/core';

import Round from './round';

interface RoundData {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
  }[];
}

interface Props {
  gameId: string;
  rounds: RoundData[];
}

const Rounds: React.FC<Props> = ({ gameId, rounds }) => {
  return (
    <List component="div">
      {rounds.map((round, index) => (
        <Round key={round.id} round={round} number={index + 1} gameId={gameId} />
      ))}
    </List>
  );
};

export default Rounds;
