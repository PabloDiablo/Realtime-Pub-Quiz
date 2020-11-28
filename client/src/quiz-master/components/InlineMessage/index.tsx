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

interface Props {
  text: string;
  isLoading?: boolean;
}

const InlineMessage: React.FC<Props> = ({ text, isLoading = false }) => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        {isLoading && <CircularProgress />}
        <Typography component="h1" variant="h5">
          {text}
        </Typography>
      </div>
    </Container>
  );
};

export default InlineMessage;
