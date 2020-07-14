import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, makeStyles, Grid } from '@material-ui/core';

import { Question, RoundData } from '../../types/state';
import { postSubmitAnswer } from '../services/player';
import { SubmitAnswerErrorReason } from '../../../shared/types/enum';

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
  },
  multipleChoices: {
    margin: theme.spacing(1)
  },
  saveMessage: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green'
  }
}));

const AnswerQuestion: React.FC<Props> = ({ question: { question, image, questionId, type, possibleOptions } = {}, round: { name } = {} }) => {
  const [teamAnswer, setTeamAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState('');

  const onChangeCurrentAnswer = (value: string) => {
    setTeamAnswer(value);
    setHasSaved(false);
  };

  const save = async (value: string) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setHasSaved(false);
    setError('');

    const res = await postSubmitAnswer({
      questionId,
      answer: value
    });

    if (res.success && res.errorReason === SubmitAnswerErrorReason.Ok) {
      setHasSaved(true);
    } else {
      setError('Failed to send answer. Please try again. If this keeps happening please refresh your browser.');
    }

    setIsSaving(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    save(teamAnswer);
  };

  const onClickMultipleChoice = (value: string) => {
    if (teamAnswer === value) {
      return;
    }

    onChangeCurrentAnswer(value);
    save(value);
  };

  const isMulti = type === 'multi';

  const classes = useStyles();

  const getButtonVariant = (value: string) => (teamAnswer === value ? 'contained' : 'outlined');

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
          {!isMulti && (
            <>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                type="text"
                value={teamAnswer}
                onChange={e => onChangeCurrentAnswer(e.target.value)}
                label="Your answer"
                autoComplete="off"
                required
              />
              <Button variant="contained" color="primary" type="submit" fullWidth disabled={isSaving || hasSaved} className={classes.button}>
                {isSaving && 'Sending...'}
                {!isSaving && hasSaved && 'Saved!'}
                {!isSaving && !hasSaved && 'Answer Question'}
              </Button>
            </>
          )}
          {isMulti && (
            <>
              <Grid container spacing={1} className={classes.multipleChoices}>
                <Grid container item xs={12} spacing={3}>
                  <Grid item xs={6}>
                    <Button
                      variant={getButtonVariant('A')}
                      color="primary"
                      disabled={isSaving || !possibleOptions[0]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('A')}
                    >
                      A: {possibleOptions[0] ?? '-'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant={getButtonVariant('B')}
                      color="primary"
                      disabled={isSaving || !possibleOptions[1]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('B')}
                    >
                      B: {possibleOptions[1] ?? '-'}
                    </Button>
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={3}>
                  <Grid item xs={6}>
                    <Button
                      variant={getButtonVariant('C')}
                      color="primary"
                      disabled={isSaving || !possibleOptions[2]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('C')}
                    >
                      C: {possibleOptions[2] ?? '-'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant={getButtonVariant('D')}
                      color="primary"
                      disabled={isSaving || !possibleOptions[3]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('D')}
                    >
                      D: {possibleOptions[3] ?? '-'}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <div className={classes.saveMessage}>
                {isSaving && 'Sending...'}
                {!isSaving && hasSaved && 'Saved!'}
              </div>
            </>
          )}
        </form>
      </Paper>
    </>
  );
};

export default AnswerQuestion;
