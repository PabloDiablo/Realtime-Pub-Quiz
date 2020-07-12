import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, makeStyles } from '@material-ui/core';

import { Question, RoundData } from '../../types/state';
import { postSubmitAnswer } from '../services/player';

interface Props {
  question: Question;
  round: RoundData;
}

const useStyles = makeStyles(theme => ({
  questionWrapper: {
    padding: theme.spacing(1)
  },
  questionText: {
    textAlign: 'center',
    margin: theme.spacing(1)
  },
  questionImage: {
    maxWidth: '450px',
    width: '100%',
    margin: '0 auto',
    display: 'block'
  },
  formWrapper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  button: {
    backgroundColor: 'green',
    marginRight: '10px',
    '&:hover': {
      backgroundColor: 'darkgreen'
    }
  },
  errorMessage: {
    margin: '10px',
    padding: '10px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    background: 'red',
    borderRadius: '5px'
  }
}));

const AnswerQuestion: React.FC<Props> = ({ question: { question, image, category, questionId } = {}, round: { name } = {} }) => {
  const [teamAnswer, setTeamAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState('');

  const onChangeCurrentAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamAnswer(e.target.value);
    setHasSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setHasSaved(false);
    setError('');

    const res = await postSubmitAnswer({
      questionId,
      answer: teamAnswer
    });

    if (res.success) {
      setHasSaved(true);
    } else {
      setError('Failed to send answer. Please try again. If this keeps happening please refresh your browser.');
    }

    setIsSaving(false);
  };

  const classes = useStyles();

  return (
    <>
      <Paper className={classes.questionWrapper}>
        <Typography variant="h4" className={classes.questionText}>
          {question}
        </Typography>
        {image && <img src={image} className={classes.questionImage} />}
        <Typography variant="body1">
          Round: <b>{name}</b>
        </Typography>
      </Paper>
      <Paper className={classes.formWrapper}>
        {error && <div className={classes.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit} className={classes.form}>
          <Typography variant="body1">You can change your answer if you need to...</Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            type="text"
            value={teamAnswer}
            onChange={onChangeCurrentAnswer}
            label="Your answer"
            autoComplete="off"
            required
          />
          <Button variant="contained" color="primary" type="submit" fullWidth disabled={isSaving || hasSaved} className={classes.button}>
            {isSaving && 'Sending...'}
            {!isSaving && hasSaved && 'Saved!'}
            {!isSaving && !hasSaved && 'Answer Question'}
          </Button>
        </form>
      </Paper>
    </>
  );
};

export default AnswerQuestion;
