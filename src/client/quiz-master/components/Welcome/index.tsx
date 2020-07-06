import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Container, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8)
  }
}));

const Welcome: React.FC<RouteComponentProps> = () => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="md">
      <div className={classes.paper}>
        <Typography component="h1" variant="h4">
          Select an option in the menu on the left
        </Typography>
      </div>
    </Container>
  );
};

export default Welcome;
