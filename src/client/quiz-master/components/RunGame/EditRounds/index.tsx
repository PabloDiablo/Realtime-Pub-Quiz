import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Card, CardContent, Typography, TextField, Button, List, Container } from '@material-ui/core';

import Round from './round';
import { getGameInfo, postGameRounds } from '../../../services/game';
import InlineMessage from '../../InlineMessage';
import { baseUrl } from '../../../config';
import { getAvailableQuestions } from '../../../services/questions';

const useStyles = makeStyles(theme => ({
  headingCard: {
    display: 'flex',
    alignItems: 'center'
  },
  headingText: {
    flexGrow: 1
  },
  formCard: {
    marginTop: theme.spacing(2)
  },
  switchLabel: {
    marginLeft: '11px',
    marginRight: 0,
    width: '100%'
  },
  form: {
    display: 'flex',
    alignItems: 'center'
  },
  textField: {
    backgroundColor: 'white',
    marginRight: theme.spacing(1)
  },
  formControl: {
    margin: theme.spacing(1),
    width: '100%'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  addButton: {
    height: '37px'
  }
}));

interface RoundData {
  id?: string;
  name: string;
  questions: string[];
}

interface AvailableQuestion {
  id: string;
  text: string;
  category: string;
}

interface Props extends RouteComponentProps {
  game?: string;
}

const EditRounds: React.FC<Props> = ({ game, navigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([]);
  const [newRound, setNewRound] = useState('');
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [deleteQueue, setDeleteQueue] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    setRounds(v => [...v, { name: newRound, questions: [] }]);

    setNewRound('');
  };

  const move = (roundName: string, isUpwards: boolean): void => {
    const round = rounds.find(r => r.name === roundName);
    const index = rounds.indexOf(round);

    if ((isUpwards && index === 0) || (!isUpwards && index === rounds.length - 1)) {
      return;
    }

    const newList = rounds.filter(r => r.name !== roundName);
    const newIndex = isUpwards ? index - 1 : index + 1;
    newList.splice(newIndex, 0, round);
    setRounds(newList);
  };

  const removeRound = (roundName: string, id: string): void => {
    setRounds(v => v.filter(r => r.name !== roundName));

    if (id) {
      setDeleteQueue(v => [...v, id]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    const res = await postGameRounds({ gameRoom: game, rounds, deleteQueue });

    if (res.success) {
      navigate(`${baseUrl}/game/${game}`);
    } else {
      setError('Could not save round data.');
    }

    setIsSaving(false);
  };

  const handleUpdateRound = (data: RoundData, index: number) => {
    const newList = [...rounds];
    const roundObject = { ...rounds[index], name: data.name, questions: data.questions };

    newList.splice(index, 1, roundObject);

    setRounds(newList);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      const [gameInfoRes, availableQuestionsRes] = await Promise.all([getGameInfo(game), getAvailableQuestions()]);

      if (gameInfoRes.success) {
        setRounds(gameInfoRes.rounds);
      } else {
        setError('Could not load game data. Please try again.');
      }

      if (availableQuestionsRes.success) {
        setAvailableQuestions(availableQuestionsRes.questions.map(q => ({ id: q.id, text: q.text, category: q.category })));
      } else {
        setError('Could not load question data');
      }

      setIsLoading(false);
    };

    if (game) {
      load();
    }
  }, [game]);

  const classes = useStyles();

  return (
    <>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5" className={classes.headingText}>
            Edit rounds and questions
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={Boolean(isSaving || isLoading || error)}
            onClick={handleSave}
          >
            Save
          </Button>
        </CardContent>
      </Card>
      {isLoading && <InlineMessage isLoading text="Loading game info..." />}
      {!isLoading && error && <InlineMessage text="There was an error loading game info" />}
      {!isLoading && !error && (
        <Container maxWidth="md">
          <Card className={classes.formCard}>
            <CardContent>
              <Typography variant="h6">Rounds</Typography>
            </CardContent>
            <List component="div">
              {rounds.map((round, index) => (
                <Round
                  key={round.name}
                  roundName={round.name}
                  id={round.id}
                  questions={round.questions}
                  isFirst={index === 0}
                  isLast={index === rounds.length - 1}
                  move={move}
                  removeRound={removeRound}
                  onEdit={data => handleUpdateRound(data, index)}
                  questionsData={availableQuestions}
                />
              ))}
            </List>
          </Card>
          <Card className={classes.formCard}>
            <CardContent>
              <form noValidate onSubmit={handleSubmit} className={classes.form}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="addround"
                  label="Add Round"
                  name="addround"
                  autoComplete="off"
                  inputProps={{ className: classes.textField }}
                  className={classes.formControl}
                  value={newRound}
                  disabled={isLoading}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRound(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary" disabled={isLoading} className={classes.addButton}>
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </Container>
      )}
    </>
  );
};

export default EditRounds;
