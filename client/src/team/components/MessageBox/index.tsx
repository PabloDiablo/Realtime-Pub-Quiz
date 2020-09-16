import React from 'react';
import { Paper, Typography, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '& > *': {
      padding: theme.spacing(2)
    },
    '& > *:not(:first-child)': {
      paddingTop: 0
    }
  }
}));

interface Props {
  heading?: React.ReactNode;
  isLoading?: boolean;
}

const MessageBox: React.FC<Props> = ({ heading, isLoading, children }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      {isLoading && <CircularProgress />}
      {heading && <Typography variant="h5">{heading}</Typography>}
      <Typography>{children}</Typography>
    </Paper>
  );
};

export default MessageBox;
