import React from 'react';
import { Paper, Typography, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'inherit',
    boxShadow: 'none',
    color: '#F2F2F2',
    '& > *': {
      padding: theme.spacing(2)
    },
    '& > *:not(:first-child)': {
      paddingTop: 0
    }
  },
  heading: {
    fontWeight: 900
  },
  body: {
    textAlign: 'center'
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
      <Typography variant="h4" className={classes.heading}>
        {isLoading ? 'Loading...' : heading}
      </Typography>
      <Typography className={classes.body}>{children}</Typography>
    </Paper>
  );
};

export default MessageBox;
