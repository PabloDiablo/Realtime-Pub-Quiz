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
  isMarking: boolean;
  isEditing: boolean;
  setTeamAnswer(teamAnswerId: string, isCorrect?: boolean): void;
}

const TeamAnswer: React.FC<Props> = ({ answer, teamAnswerId, isFirstCorrectAnswer, team, isMarking, isEditing, setTeamAnswer }) => (
  <TableRow style={{ height: '70px' }}>
    <TableCell align="left">
      {isFirstCorrectAnswer && '⭐'}
      {team?.teamName} [{team?.playerCode}]
    </TableCell>
    <TableCell>{answer.answer ?? 'No answer given yet'}</TableCell>
    <TableCell align="right">
      {isMarking && <Actions teamAnswerId={teamAnswerId} answer={answer} setTeamAnswer={setTeamAnswer} isEditing={isEditing} />}
    </TableCell>
  </TableRow>
);

export default TeamAnswer;
