import React from 'react';
import { TableRow, TableCell } from '@material-ui/core';

import { TeamSubmittedAnswer } from '../../../../../shared/types/quizMaster';

interface Props {
  answer: TeamSubmittedAnswer;
  isFirstCorrectAnswer: boolean;
  gameId: string;
  questionId: string;
  setTeamAnswers(answers: TeamSubmittedAnswer[]): void;
}

const TeamAnswer: React.FC<Props> = ({ answer, isFirstCorrectAnswer }) => {
  return (
    <TableRow>
      <TableCell>
        {isFirstCorrectAnswer && '⭐'}
        {answer.team.name}
      </TableCell>
      <TableCell>{answer.gegeven_antwoord ?? 'No answer given yet'}</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  );
};

export default TeamAnswer;
