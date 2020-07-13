import React, { useState } from 'react';
import { Button, Typography, Paper, TextField, makeStyles } from '@material-ui/core';

import { ActionTypes, Action } from '../state/context';
import { openRealtimeDbConnection } from '../state/realtime-db';
import { postJoinGame } from '../services/player';
import { JoinGameErrorReason } from '../../../shared/types/enum';

interface Props {
  dispatch(action: Action): void;
}

interface State {
  isSaving: boolean;
  gameRoomName: string;
  teamName: string;
  playerCode: string;
  error: string;
}

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2)
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

const getPlayerCodeFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  return pathParts && pathParts[1] ? pathParts[1] : '';
};

const NewTeam: React.FC<Props> = ({ dispatch }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [gameRoomName, setGameRoomName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [playerCode, setPlayerCode] = useState(getPlayerCodeFromUrl());
  const [error, setError] = useState('');

  const classes = useStyles();

  const dispatchTeamName = (newTeamName: string) => dispatch({ type: ActionTypes.SetTeamName, teamName: newTeamName });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!gameRoomName || !teamName || !playerCode) {
      setError("Looks like you didn't enter all the details. Please check and try again.");

      return;
    }

    setIsSaving(true);

    const res = await postJoinGame({
      gameRoom: gameRoomName,
      teamName,
      playerCode
    });

    if (res.success) {
      if (res.errorReason === JoinGameErrorReason.Ok) {
        dispatchTeamName(teamName);
        openRealtimeDbConnection({ gameId: res.gameRoom, teamId: res.teamId }, dispatch);

        return;
      } else if (res.errorReason === JoinGameErrorReason.GameRoomNotFound) {
        setError("The game room you entered doesn't exist. Please check and try again.");
      } else if (res.errorReason === JoinGameErrorReason.PlayerCodeInvalid) {
        setError("We didn't recognise that player code. Please check and try again.");
      } else if (res.errorReason === JoinGameErrorReason.TeamNameTaken) {
        setError('That team name is already taken! Please pick a different name and try again.');
      } else if (res.errorReason === JoinGameErrorReason.MissingValues) {
        setError("Looks like you didn't enter all the details. Please check and try again.");
      }
    } else {
      setError('There was a problem joining the game. Please check your internet connection and try again.');
    }

    setIsSaving(false);
  };

  return (
    <Paper className={classes.paper}>
      <Typography component="h1" variant="h5">
        Join the quiz
      </Typography>
      {error && <div className={classes.errorMessage}>{error}</div>}
      <form className={classes.form} onSubmit={handleSubmit}>
        <Typography variant="body1">Enter the quiz code here</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          value={gameRoomName}
          onChange={e => setGameRoomName(e.target.value)}
          label="Quiz code"
          autoComplete="off"
          disabled={isSaving}
        />
        <Typography variant="body1">Enter your unique player code</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          value={playerCode}
          onChange={e => setPlayerCode(e.target.value)}
          label="Player code"
          autoComplete="off"
          disabled={isSaving}
        />
        <Typography variant="body1">Enter your team name</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          label="Team name"
          autoComplete="off"
          disabled={isSaving}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth disabled={isSaving} className={classes.button}>
          {isSaving ? 'Joining...' : 'Join Game'}
        </Button>
      </form>
    </Paper>
  );
};

export default NewTeam;
