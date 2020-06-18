import React from 'react';
import { Container, CircularProgress, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}));

const Loading: React.FC = () => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <CircularProgress />
        <Typography component="h1" variant="h5">
          Loading the Quiz Master's tools...
        </Typography>
      </div>
    </Container>
  );
};

export default Loading;
