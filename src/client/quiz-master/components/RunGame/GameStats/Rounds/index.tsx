import React from 'react';
import { List } from '@material-ui/core';

import Round from './round';

const mockData = {
  rounds: [
    {
      id: 'r1',
      name: 'Mystery',
      questions: [
        {
          id: 'r1q1',
          text: 'What is this?'
        },
        {
          id: 'r1q2',
          text: 'Who is this?'
        },
        {
          id: 'r1q3',
          text: 'Who made this?'
        }
      ]
    },
    {
      id: 'r2',
      name: 'Music',
      questions: [
        {
          id: 'r2q1',
          text: 'Who sang this?'
        },
        {
          id: 'r2q2',
          text: 'Who is this?'
        },
        {
          id: 'r2q3',
          text: 'Who sang this?'
        }
      ]
    }
  ]
};

interface Props {
  gameId: string;
}

const Rounds: React.FC<Props> = ({ gameId }) => {
  const rounds = mockData.rounds;

  return (
    <List component="div">
      {rounds.map((round, index) => (
        <Round key={round.id} round={round} number={index + 1} gameId={gameId} />
      ))}
    </List>
  );
};

export default Rounds;
