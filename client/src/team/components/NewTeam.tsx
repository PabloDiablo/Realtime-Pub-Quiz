import React, { useState } from 'react';
import { Button, Typography, Paper, TextField, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';

import { ActionTypes, Action } from '../state/context';
import { openRealtimeDbConnection } from '../state/realtime-db';
import { postJoinGame } from '../services/player';
import { JoinGameErrorReason } from '../../../../types/enum';

interface Props {
  dispatch(action: Action): void;
}

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    backgroundColor: 'unset',
    boxShadow: 'none',
    color: '#F2F2F2'
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
    marginTop: theme.spacing(1)
  },
  formHint: {
    textAlign: 'center'
  },
  formFieldContainer: {
    '& .MuiInputBase-root': {
      borderRadius: 0
    }
  },
  formField: {
    color: '#073B4C',
    backgroundColor: '#F2F2F2'
  },
  button: {
    backgroundColor: '#F2F2F2',
    marginTop: '18px',
    marginRight: '10px',
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
  checkboxGroup: {
    margin: '5px auto'
  },
  checkboxLabel: {
    '& a': {
      color: '#F2F2F2',
      textDecoration: 'underline'
    }
  },
  checkbox: {
    color: '#F2F2F2'
  },
  checkboxChecked: {
    color: '#F2F2F2 !important'
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
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const classes = useStyles();

  const dispatchTeamName = (newTeamName: string) => dispatch({ type: ActionTypes.SetTeamName, teamName: newTeamName });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!gameRoomName || !teamName || !playerCode) {
      setError("Looks like you didn't enter all the details. Please check and try again.");

      return;
    }

    if (!hasAcceptedTerms) {
      setError('You must accept the terms and conditions and privacy policy to play the game.');
      return;
    }

    setIsSaving(true);

    const res = await postJoinGame({
      gameRoom: gameRoomName,
      teamName,
      playerCode,
      acceptedTerms: hasAcceptedTerms
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
      } else if (res.errorReason === JoinGameErrorReason.TermsNotAccepted) {
        setError('You must accept the terms and conditions and privacy policy to play the game.');
      }
    } else {
      setError('There was a problem joining the game. Please check your internet connection and try again.');
    }

    setIsSaving(false);
  };

  return (
    <Paper className={classes.paper}>
      {error && <div className={classes.errorMessage}>{error}</div>}
      <form className={classes.form} onSubmit={handleSubmit}>
        <Typography variant="body1" className={classes.formLabel}>
          Enter the Game Code:
        </Typography>
        <TextField
          inputProps={{ className: classes.formField }}
          classes={{ root: classes.formFieldContainer }}
          variant="outlined"
          margin="normal"
          fullWidth
          value={gameRoomName}
          onChange={e => setGameRoomName(e.target.value)}
          autoComplete="off"
          disabled={isSaving}
        />
        <Typography variant="body1" className={classes.formLabel}>
          Enter your Unique Player ID:
        </Typography>
        <TextField
          inputProps={{ className: classes.formField }}
          classes={{ root: classes.formFieldContainer }}
          variant="outlined"
          margin="normal"
          fullWidth
          value={playerCode}
          onChange={e => setPlayerCode(e.target.value)}
          autoComplete="off"
          disabled={isSaving}
        />
        <Typography variant="body1" className={classes.formLabel}>
          Create a name for your team:
        </Typography>
        <TextField
          inputProps={{ className: classes.formField }}
          classes={{ root: classes.formFieldContainer }}
          variant="outlined"
          margin="normal"
          fullWidth
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          autoComplete="off"
          disabled={isSaving}
        />
        <Typography variant="body2" className={classes.formHint}>
          Your team name will be made public on the leaderboard, so don't share any private information!
        </Typography>
        <FormControlLabel
          className={classes.checkboxGroup}
          control={
            <Checkbox
              checked={hasAcceptedTerms}
              onChange={event => setHasAcceptedTerms(event.target.checked)}
              name="termsCheckbox"
              color="primary"
              classes={{ root: classes.checkbox, checked: classes.checkboxChecked }}
            />
          }
          label={
            <span className={classes.checkboxLabel}>
              I have read and accept the{' '}
              <a href="https://quizwhip.co.uk/terms" target="_blank" rel="noopener noreferrer">
                terms and conditions
              </a>{' '}
              and{' '}
              <a href="https://quizwhip.co.uk/privacy" target="_blank" rel="noopener noreferrer">
                privacy policy
              </a>
              .
            </span>
          }
        />
        <Button variant="contained" color="primary" type="submit" fullWidth disabled={isSaving} className={classes.button}>
          {isSaving ? 'Joining...' : 'Join Game'}
        </Button>
      </form>
    </Paper>
  );
};

export default NewTeam;
