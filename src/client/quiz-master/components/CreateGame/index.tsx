import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Container, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Collapse } from '@material-ui/core';

import { FastAnswerOptions } from '../../types/state';
import { postCreateGame } from '../../services/game';
import { baseUrl } from '../../config';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  switchLabel: {
    marginLeft: '11px',
    marginRight: 0,
    width: '100%'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  textField: {
    backgroundColor: 'white'
  },
  formControl: {
    margin: theme.spacing(1),
    width: '100%'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  error: {
    color: 'red'
  }
}));

const CreateGame: React.FC<RouteComponentProps> = ({ navigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomName, setRoomName] = useState('');
  const [correctPoints, setCorrectPoints] = useState(10);
  const [randomPrizePosition, setRandomPrizePosition] = useState<number | undefined>();
  const [fastOption, setFastOption] = useState(FastAnswerOptions.None);
  const [fastBonusPoints, setFastBonusPoints] = useState<number | undefined>();
  const [fastBonusNumTeams, setFastBonusNumTeams] = useState<number | undefined>();

  const handleFastOptionChange = (e: React.ChangeEvent<{ value: FastAnswerOptions }>) => {
    setFastOption(e.target.value);

    switch (e.target.value) {
      case FastAnswerOptions.None:
        setFastBonusPoints(undefined);
        setFastBonusNumTeams(undefined);
        break;
      case FastAnswerOptions.FastSingle:
        setFastBonusNumTeams(undefined);
        break;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    const res = await postCreateGame({
      roomName,
      correctPoints,
      randomPrizePosition,
      fastAnswerMethod: fastOption,
      bonusPoints: fastBonusPoints,
      bonusNumTeams: fastBonusNumTeams
    });

    if (!res.success) {
      setError('There was a connection error. Please try again.');
    } else if (res.gameRoomAlreadyExists) {
      setError('Game room name is already taken.');
    } else if (res.validationError) {
      setError('There was a validation error. Check the values and try again.');
    } else {
      navigate(`${baseUrl}/game/${roomName}`);
      return;
    }

    setIsLoading(false);
  };

  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Create a new game
        </Typography>
        {error && <Typography className={classes.error}>{error}</Typography>}
        <form className={classes.form} noValidate onSubmit={onSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="roomname"
            label="Game Room Name"
            name="roomname"
            autoComplete="off"
            autoFocus
            inputProps={{ className: classes.textField }}
            disabled={isLoading}
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="correctpoints"
            label="Points per Correct Answer"
            name="correctpoints"
            autoComplete="off"
            inputProps={{ className: classes.textField }}
            disabled={isLoading}
            value={correctPoints}
            onChange={e => setCorrectPoints(Number(e.target.value) || undefined)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="randompos"
            label="Random Prize Position"
            name="randompos"
            autoComplete="off"
            inputProps={{ className: classes.textField }}
            disabled={isLoading}
            value={randomPrizePosition}
            onChange={e => setRandomPrizePosition(Number(e.target.value) || undefined)}
          />
          <FormControl className={classes.formControl}>
            <InputLabel id="fast-answer-bonus-label">Fast Answer Bonus</InputLabel>
            <Select labelId="fast-answer-bonus-label" id="fast-answer-bonus-select" value={fastOption} onChange={handleFastOptionChange}>
              <MenuItem value={FastAnswerOptions.None}>None</MenuItem>
              <MenuItem value={FastAnswerOptions.FastSingle}>Single Fastest</MenuItem>
              <MenuItem value={FastAnswerOptions.FastX}>Fastest X</MenuItem>
              <MenuItem value={FastAnswerOptions.Sliding}>Sliding</MenuItem>
            </Select>
          </FormControl>
          <Collapse in={fastOption === FastAnswerOptions.FastSingle || fastOption === FastAnswerOptions.Sliding} timeout="auto" unmountOnExit>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="bonuspoints"
              label="Fastest Answer Bonus"
              name="bonuspoints"
              autoComplete="off"
              inputProps={{ className: classes.textField }}
              disabled={isLoading}
              value={fastBonusPoints}
              onChange={e => setFastBonusPoints(Number(e.target.value) || undefined)}
            />
          </Collapse>
          <Collapse in={fastOption === FastAnswerOptions.FastX} timeout="auto" unmountOnExit>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="bonuspoints"
              label="Fastest Answer Bonus"
              name="bonuspoints"
              autoComplete="off"
              inputProps={{ className: classes.textField }}
              disabled={isLoading}
              value={fastBonusPoints}
              onChange={e => setFastBonusPoints(Number(e.target.value) || undefined)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="bonuspointspct"
              label="Number of Teams"
              name="bonuspointspct"
              autoComplete="off"
              inputProps={{ className: classes.textField }}
              disabled={isLoading}
              value={fastBonusNumTeams}
              onChange={e => setFastBonusNumTeams(Number(e.target.value) || undefined)}
            />
          </Collapse>
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default CreateGame;
