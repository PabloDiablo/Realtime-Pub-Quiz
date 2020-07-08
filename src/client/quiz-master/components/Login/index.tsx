import React, { useState } from 'react';
import { makeStyles, Container, Typography, TextField, Button } from '@material-ui/core';

import { postLogin } from '../../services/auth';
import { useStateContext, ActionTypes } from '../../state/context';
import { openRealtimeDbConnection } from '../../state/realtime-db';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logo: {
    margin: theme.spacing(1)
  },
  logoImage: {
    width: '100%'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  textField: {
    backgroundColor: 'white'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const { dispatch } = useStateContext();

  const classes = useStyles();

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    const res = await postLogin(passcode);

    if (res.success) {
      if (res.isPasscodeCorrect) {
        setIsLoading(false);
        dispatch({ type: ActionTypes.SetIsLoggedIn, isLoggedIn: true });
        openRealtimeDbConnection(dispatch);

        return;
      } else {
        setError('The passcode is incorrect. Please try again.');
      }
    } else {
      setError('There was a connection error. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <div className={classes.logo}>
          <img src="/images/logo.png" alt="QuizWhip Logo" className={classes.logoImage} />
        </div>
        <Typography component="h1" variant="h5">
          Login to the Quiz Master portal
        </Typography>
        <form className={classes.form} noValidate onSubmit={submitForm}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="passcode"
            label="Passcode"
            name="passcode"
            autoComplete="off"
            autoFocus
            inputProps={{ className: classes.textField }}
            onChange={evt => setPasscode(evt.target.value)}
            error={!!error}
            helperText={error}
            disabled={isLoading}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit} disabled={isLoading}>
            {isLoading ? 'Please wait...' : 'Log In'}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default Login;
