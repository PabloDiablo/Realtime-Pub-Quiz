import React, { useState } from 'react';
import { ListItem, ListItemText, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import EditIcon from '@material-ui/icons/Edit';

import RoundDialog from './RoundDialog';

interface RoundData {
  name: string;
  questions: string[];
}

interface Props {
  roundName: string;
  questions: string[];
  isFirst: boolean;
  isLast: boolean;
  questionsData: {
    id: string;
    text: string;
    category: string;
  }[];
  move(code: string, isUpwards: boolean): void;
  removeRound(code: string): void;
  onEdit(data: RoundData): void;
}

const Round: React.FC<Props> = ({ roundName, questions, isFirst, isLast, questionsData, move, removeRound, onEdit }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onCloseDialog = (data: RoundData) => {
    setIsDialogOpen(false);

    onEdit(data);
  };

  return (
    <>
      <ListItem>
        <ListItemText>{roundName}</ListItemText>

        <div onClick={() => setIsDialogOpen(true)}>
          <IconButton aria-label="edit">
            <EditIcon />
          </IconButton>
        </div>

        <div onClick={() => move(roundName, true)}>
          <IconButton aria-label="move up" disabled={isFirst}>
            <ArrowUpwardIcon />
          </IconButton>
        </div>

        <div onClick={() => move(roundName, false)}>
          <IconButton aria-label="move down" disabled={isLast}>
            <ArrowDownwardIcon />
          </IconButton>
        </div>

        <div onClick={() => removeRound(roundName)}>
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </div>
      </ListItem>
      <RoundDialog data={{ name: roundName, questions }} isOpen={isDialogOpen} onClose={onCloseDialog} questionsData={questionsData} />
    </>
  );
};

export default Round;
