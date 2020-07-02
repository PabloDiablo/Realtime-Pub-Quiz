import React, { useState, useEffect } from 'react';
import { Router } from '@reach/router';
import { makeStyles } from '@material-ui/core';

import { useStateContext, ActionTypes } from '../state/context';
import { openRealtimeDbConnection } from '../state/realtime-db';
import { getHasSession } from '../services/auth';
import { baseUrl } from '../config';

import Login from './Login';
import Menu from './Menu';
import Welcome from './Welcome';
import CreateGame from './CreateGame';
import RunGame from './RunGame';
import ListQuestions from './ListQuestions';
import InlineMessage from './InlineMessage';

const useStyles = makeStyles({
  masterDetailContainer: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden'
  },
  master: {
    width: '240px',
    flexShrink: 0,
    overflowY: 'auto',
    backgroundColor: 'rgba(2, 12, 22)',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '5px',
    boxSizing: 'border-box'
  },
  detail: {
    width: 'calc(100% - 240px)',
    overflowY: 'auto'
  }
});

const QuizMaster: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const {
    state: { isLoggedIn, hasConnected, games },
    dispatch
  } = useStateContext();

  const classes = useStyles();

  useEffect(() => {
    const hasSession = async () => {
      setIsLoading(true);
      const res = await getHasSession();
      const isLoggedIn = res.success && res.hasSession;

      dispatch({ type: ActionTypes.SetIsLoggedIn, isLoggedIn });

      if (res.success && isLoggedIn) {
        openRealtimeDbConnection(dispatch);
      }

      setIsLoading(false);
    };

    hasSession();
  }, [dispatch]);

  if (isLoading || (isLoggedIn && !hasConnected)) {
    return <InlineMessage isLoading text="Loading the Quiz Master's tools..." />;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className={classes.masterDetailContainer}>
      <Menu games={games} className={classes.master} />
      <div className={classes.detail}>
        <Router basepath={baseUrl}>
          <Welcome path="/" />
          <CreateGame path="/create-game" />
          <RunGame path="/game/:game/*" />
          <ListQuestions path="/list-questions" />
        </Router>
      </div>
    </div>
  );
};

export default QuizMaster;
