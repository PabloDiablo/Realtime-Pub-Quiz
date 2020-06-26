import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Card, CardContent, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Container } from '@material-ui/core';

import { QuestionType } from '../../../../../shared/types/enum';
import Round from './round';

const mockQuestionsData = {
  questions: [
    {
      id: 'r1q1',
      text: 'What is this?',
      answer: 'Beer',
      type: QuestionType.FreeText,
      category: 'Mystery'
    },
    {
      id: 'r1q2',
      text: 'Who is this?',
      answer: 'Bob',
      type: QuestionType.FreeText,
      category: 'Mystery'
    },
    {
      id: 'r1q3',
      text: 'Who made this?',
      answer: 'Betty',
      type: QuestionType.FreeText,
      category: 'Mystery'
    },
    {
      id: 'r2q1',
      text: 'Who sang this?',
      answer: 'Sharon',
      type: QuestionType.FreeText,
      category: 'Music'
    },
    {
      id: 'r2q2',
      text: 'Who is this?',
      answer: 'Karen',
      type: QuestionType.FreeText,
      category: 'Music'
    },
    {
      id: 'r2q3',
      text: 'Who sang this?',
      answer: ['Billy', 'Freddie', 'Kelly', 'Lizzy'],
      type: QuestionType.MultipleChoice,
      category: 'Music'
    }
  ]
};

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
  name: string;
  questions: string[];
}

const EditRounds: React.FC<RouteComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [newRound, setNewRound] = useState('');
  const [rounds, setRounds] = useState<RoundData[]>([]);

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

  const removeRound = (roundName: string): void => {
    setRounds(v => v.filter(r => r.name !== roundName));
  };

  const handleSave = () => {
    console.log('saving...');
  };

  const handleUpdateRound = (data: RoundData) => {
    console.log('set round data', data);
  };

  const classes = useStyles();

  return (
    <>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5" className={classes.headingText}>
            Edit rounds and questions
          </Typography>
          <Button type="submit" variant="contained" color="primary" onClick={handleSave} className={classes.submit} disabled={isLoading}>
            Save
          </Button>
        </CardContent>
      </Card>
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
                questions={round.questions}
                isFirst={index === 0}
                isLast={index === rounds.length - 1}
                move={move}
                removeRound={removeRound}
                onEdit={handleUpdateRound}
                questionsData={mockQuestionsData.questions}
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
    </>
  );
};

export default EditRounds;
