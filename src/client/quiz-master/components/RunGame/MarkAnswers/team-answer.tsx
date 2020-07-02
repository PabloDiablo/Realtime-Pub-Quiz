import React from 'react';
import { TableRow, TableCell } from '@material-ui/core';

import Actions from './actions';
import { Team } from '../../../types/state';

interface TeamAnswerData {
  id: string;
  gameId: string;
  questionId: string;
  teamId: string;
  timestamp: number;
  answer: string;
  isCorrect?: boolean;
}

interface Props {
  answer: TeamAnswerData;
  isFirstCorrectAnswer: boolean;
  teamAnswerId: string;
  team: Team;
  setTeamAnswer(teamAnswerId: string, isCorrect?: boolean): void;
}

const TeamAnswer: React.FC<Props> = ({ answer, teamAnswerId, isFirstCorrectAnswer, team, setTeamAnswer }) => {
  return (
    <TableRow style={{ height: '70px' }}>
      <TableCell align="left">
        {isFirstCorrectAnswer && '⭐'}
        {team?.teamName}
      </TableCell>
      <TableCell>{answer.answer ?? 'No answer given yet'}</TableCell>
      <TableCell align="right">
        <Actions teamAnswerId={teamAnswerId} answer={answer} setTeamAnswer={setTeamAnswer} />
      </TableCell>
    </TableRow>
  );
};

export default TeamAnswer;
