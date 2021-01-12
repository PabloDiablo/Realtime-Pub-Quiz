import React, { useEffect, useState } from 'react';
import { Container, makeStyles } from '@material-ui/core';

import AnswerQuestion from './AnswerQuestion';
import NewTeam from './NewTeam';
import MessageBox from './MessageBox';

import { getHasSession } from '../services/player';
import { useStateContext } from '../state/context';
import { GameStatus, TeamStatus } from '../../../../types/status';
import TeamInfo from './TeamInfo';
import { openRealtimeDbConnection } from '../state/realtime-db';
import HeaderLogo from './HeaderLogo';

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: theme.spacing(2)
  }
}));

const TeamApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isNewConnection, setIsNewConnection] = useState(false);

  const {
    state: { hasConnected, gameStatus, teamStatus, question, teamName, round, score },
    dispatch
  } = useStateContext();

  useEffect(() => {
    const hasSession = async () => {
      setIsLoading(true);
      const res = await getHasSession();

      if (res.success && res.hasSession) {
        openRealtimeDbConnection({ gameId: res.gameRoom, teamId: res.teamId }, dispatch);
      } else {
        setIsNewConnection(true);
      }

      setIsLoading(false);
    };

    hasSession();
  }, [dispatch]);

  const classes = useStyles();

  let component;

  if ((!hasConnected && !isNewConnection) || isLoading) {
    component = <MessageBox isLoading />;
  } else if (teamStatus === TeamStatus.Waiting) {
    component = <MessageBox>Please wait for your player code and team name to be accepted.</MessageBox>;
  } else if (teamStatus === TeamStatus.Blocked) {
    component = <MessageBox>You have been blocked from the game</MessageBox>;
  } else if (gameStatus === GameStatus.Lobby && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading={teamName}>The game will begin shortly...</MessageBox>;
  } else if (gameStatus === GameStatus.RoundIntro && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading={teamName}>The round has not started yet. Good luck!</MessageBox>;
  } else if (gameStatus === GameStatus.PreQuestion && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading={teamName}>Please wait for the question...</MessageBox>;
  } else if (gameStatus === GameStatus.AskingQuestion && teamStatus === TeamStatus.Joined) {
    component = <AnswerQuestion question={question} round={round} score={score} />;
  } else if (gameStatus === GameStatus.QuestionClosed && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading={teamName}>Good luck - your answer is being scored.</MessageBox>;
  } else if (gameStatus === GameStatus.RoundEnded) {
    component = <MessageBox heading={teamName}>This round has now ended.</MessageBox>;
  } else if (gameStatus === GameStatus.EndGame) {
    component = (
      <MessageBox heading={teamName}>
        The game has now ended - thanks for playing.
        <br />
        How did you do?
      </MessageBox>
    );
  } else if (teamStatus === TeamStatus.Quit || teamStatus === TeamStatus.Unknown) {
    component = <NewTeam dispatch={dispatch} />;
  }

  return (
    <>
      <TeamInfo />
      <Container component="main" maxWidth="md" className={classes.container}>
        <HeaderLogo />
        {component}
      </Container>
    </>
  );
};

export default TeamApp;
