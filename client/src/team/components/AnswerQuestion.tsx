import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, makeStyles, Grid } from '@material-ui/core';

import { Question, RoundData } from '../../types/state';
import { postSubmitAnswer } from '../services/player';
import { SubmitAnswerErrorReason } from '../../../../types/enum';

interface Props {
  question: Question;
  round: RoundData;
  score: number;
}

const useStyles = makeStyles(theme => ({
  infoWrapper: {
    color: '#F2F2F2',
    display: 'flex',
    justifyContent: 'space-around',
    margin: `${theme.spacing(1)}px 0`
  },
  infoHeavy: {
    fontWeight: 900
  },
  questionWrapper: {
    padding: theme.spacing(1),
    border: '5px #5B507A solid',
    borderRadius: '20px',
    backgroundColor: '#F2F2F2',
    color: '#151613'
  },
  questionText: {
    textAlign: 'center',
    margin: theme.spacing(1),
    fontWeight: 900
  },
  questionImage: {
    maxWidth: '450px',
    width: '100%',
    margin: '0 auto',
    display: 'block'
  },
  formWrapper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    background: 'unset',
    boxShadow: 'none'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column'
  },
  formLabel: {
    fontWeight: 700,
    textAlign: 'center',
    margin: theme.spacing(1),
    color: '#F2F2F2'
  },
  button: {
    backgroundColor: '#F2F2F2',
    marginTop: theme.spacing(1),
    color: '#151613',
    fontWeight: 700,
    width: '12rem',
    border: '5px #06D6A0 solid',
    borderRadius: '20px',
    textTransform: 'unset',
    alignSelf: 'center',
    '&:hover': {
      backgroundColor: '#F2F2F2'
    },
    '&:disabled': {
      backgroundColor: '#F2F2F2'
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
  gridColumn: {
    padding: '10px 2px !important'
  },
  gridRow: {
    padding: '4px 0'
  },
  multipleChoices: {
    margin: theme.spacing(1)
  },
  choiceButton: {
    borderRadius: '20px',
    textTransform: 'unset',
    background: '#F2F2F2',
    lineHeight: '35px',
    color: '#151613',
    fontWeight: 900,
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: '#F2F2F2'
    }
  },
  redChoiceButton: {
    border: '5px #EF476F solid',
    '&:hover': {
      border: '5px #EF476F solid'
    },
    '&:disabled': {
      border: '5px #EF476F solid'
    }
  },
  redChoiceButtonActive: {
    background: '#F7A1B5',
    '&:hover': {
      background: '#F7A1B5'
    }
  },
  greenChoiceButton: {
    border: '5px #06D6A0 solid',
    '&:hover': {
      border: '5px #06D6A0 solid'
    },
    '&:disabled': {
      border: '5px #06D6A0 solid'
    }
  },
  greenChoiceButtonActive: {
    background: '#9CFCE3',
    '&:hover': {
      background: '#9CFCE3'
    }
  },
  blueChoiceButton: {
    border: '5px #118AB2 solid',
    '&:hover': {
      border: '5px #118AB2 solid'
    },
    '&:disabled': {
      border: '5px #118AB2 solid'
    }
  },
  blueChoiceButtonActive: {
    background: '#A2E1F6',
    '&:hover': {
      background: '#A2E1F6'
    }
  },
  yellowChoiceButton: {
    border: '5px #FFD166 solid',
    '&:hover': {
      border: '5px #FFD166 solid'
    },
    '&:disabled': {
      border: '5px #FFD166 solid'
    }
  },
  yellowChoiceButtonActive: {
    background: '#FFE099',
    '&:hover': {
      background: '#FFE099'
    }
  },
  saveMessage: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#F2F2F2',
    textTransform: 'uppercase'
  },
  formFieldContainer: {
    '& .MuiInputBase-root': {
      borderRadius: 0
    },
    marginTop: 0
  },
  formField: {
    color: '#073B4C',
    backgroundColor: '#F2F2F2'
  }
}));

const AnswerQuestion: React.FC<Props> = ({
  question: { question, image, questionId, type, possibleOptions } = {},
  round: { name, numOfQuestions, currentQuestionNumber } = {},
  score = 0
}) => {
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

  const getButtonClassNames = (value: string, colourStyle: string, activeStyle: string) =>
    `${classes.choiceButton} ${colourStyle} ${teamAnswer === value ? activeStyle : ''}`;

  return (
    <>
      <div className={classes.infoWrapper}>
        <div>
          Q:{' '}
          <span className={classes.infoHeavy}>
            {currentQuestionNumber}/{numOfQuestions}
          </span>
        </div>
        <div className={classes.infoHeavy}>{name}</div>
        <div>
          Score: <span className={classes.infoHeavy}>{score}</span>
        </div>
      </div>
      <Paper className={classes.questionWrapper}>
        <Typography variant="h4" className={classes.questionText}>
          {question}
        </Typography>
        {image && <img src={image} className={classes.questionImage} />}
      </Paper>
      <Paper className={classes.formWrapper}>
        {error && <div className={classes.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit} className={classes.form}>
          {!isMulti && (
            <>
              <Typography variant="body1" className={classes.formLabel}>
                Your answer:
              </Typography>
              <TextField
                inputProps={{ className: classes.formField }}
                classes={{ root: classes.formFieldContainer }}
                variant="outlined"
                margin="normal"
                fullWidth
                type="text"
                value={teamAnswer}
                onChange={e => onChangeCurrentAnswer(e.target.value)}
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
                <Grid container item xs={12} spacing={3} className={classes.gridRow}>
                  <Grid item xs={6} className={classes.gridColumn}>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={isSaving || !possibleOptions[0]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('A')}
                      className={getButtonClassNames('A', classes.redChoiceButton, classes.redChoiceButtonActive)}
                    >
                      {possibleOptions[0] ?? '-'}
                    </Button>
                  </Grid>
                  <Grid item xs={6} className={classes.gridColumn}>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={isSaving || !possibleOptions[1]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('B')}
                      className={getButtonClassNames('B', classes.greenChoiceButton, classes.greenChoiceButtonActive)}
                    >
                      {possibleOptions[1] ?? '-'}
                    </Button>
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={3} className={classes.gridRow}>
                  <Grid item xs={6} className={classes.gridColumn}>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={isSaving || !possibleOptions[2]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('C')}
                      className={getButtonClassNames('C', classes.blueChoiceButton, classes.blueChoiceButtonActive)}
                    >
                      {possibleOptions[2] ?? '-'}
                    </Button>
                  </Grid>
                  <Grid item xs={6} className={classes.gridColumn}>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={isSaving || !possibleOptions[3]}
                      fullWidth
                      onClick={() => onClickMultipleChoice('D')}
                      className={getButtonClassNames('D', classes.yellowChoiceButton, classes.yellowChoiceButtonActive)}
                    >
                      {possibleOptions[3] ?? '-'}
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
