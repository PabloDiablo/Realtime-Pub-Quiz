import React, { useState, useEffect } from 'react';
import { Button, makeStyles, Typography } from '@material-ui/core';
import UndoIcon from '@material-ui/icons/Undo';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { postSetAnswerState } from '../../../services/game';

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
  teamAnswerId: string;
  isEditing: boolean;
  setTeamAnswer(teamAnswerId: string, isCorrect?: boolean): void;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  correctLabel: {
    color: 'green',
    marginRight: '10px'
  },
  wrongLabel: {
    color: 'red',
    marginRight: '10px'
  },
  correctButton: {
    backgroundColor: 'green',
    marginRight: '10px',
    '&:hover': {
      backgroundColor: 'darkgreen'
    }
  },
  incorrectButton: {
    backgroundColor: 'red',
    '&:hover': {
      backgroundColor: 'darkred'
    }
  }
});

const Actions: React.FC<Props> = ({ answer, teamAnswerId, isEditing, setTeamAnswer }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUndo, setHasUndo] = useState(false);

  useEffect(() => {
    setHasUndo(false);
  }, [answer.isCorrect]);

  const classes = useStyles();

  // isCorrect can be undefined
  const isMarked = answer.isCorrect === true || answer.isCorrect === false;

  if (isSaving) {
    return <Typography variant="body1">Saving...</Typography>;
  }

  if (!hasUndo && isMarked) {
    const label = answer.isCorrect ? 'Correct' : 'Wrong';
    const labelClass = answer.isCorrect ? classes.correctLabel : classes.wrongLabel;

    return (
      <div className={classes.container}>
        <Typography variant="body1" className={labelClass}>
          {label}
        </Typography>
        <Button
          type="submit"
          onClick={() => {
            setHasUndo(true);
          }}
          variant="contained"
          color="primary"
        >
          <UndoIcon />
        </Button>
      </div>
    );
  }

  const markAnswer = async (isCorrect: boolean) => {
    setIsSaving(true);
    const res = await postSetAnswerState({
      teamAnswerId,
      isCorrect,
      shouldCalculateScores: isEditing
    });

    if (res.success) {
      setTeamAnswer(teamAnswerId, isCorrect);
    }

    setIsSaving(false);
    setHasUndo(false);
  };

  return (
    <div className={classes.container}>
      <Button type="submit" onClick={() => markAnswer(true)} variant="contained" color="primary" className={classes.correctButton}>
        <CheckIcon />
      </Button>
      <Button type="submit" onClick={() => markAnswer(false)} variant="contained" color="primary" className={classes.incorrectButton}>
        <CloseIcon />
      </Button>
    </div>
  );
};

export default Actions;
