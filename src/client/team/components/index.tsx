import React, { useEffect, useState } from 'react';
import { Container, makeStyles } from '@material-ui/core';

import AnswerQuestion from './AnswerQuestion';
import NewTeam from './NewTeam';
import MessageBox from './MessageBox';

import { getHasSession } from '../services/player';
import { useStateContext } from '../state/context';
import { GameStatus, TeamStatus } from '../../../shared/types/status';
import TeamInfo from './TeamInfo';
import { openRealtimeDbConnection } from '../state/realtime-db';
import TeamPending from './TeamPending';
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
    state: { hasConnected, gameStatus, teamStatus, question, teamName, round },
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
    component = <MessageBox heading="Loading..." isLoading />;
  } else if (teamStatus === TeamStatus.Waiting) {
    component = <TeamPending />;
  } else if (teamStatus === TeamStatus.Blocked) {
    component = <MessageBox heading="Blocked">You have been blocked from the game</MessageBox>;
  } else if (gameStatus === GameStatus.Lobby && teamStatus === TeamStatus.Joined) {
    const heading = (
      <>
        <strong>{teamName}</strong> - your player code and team name has been accepted! 👍
      </>
    );

    component = <MessageBox heading={heading}>Please wait for the quiz to begin...</MessageBox>;
  } else if (gameStatus === GameStatus.RoundIntro && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading="⏳ Please wait... ⏳">The round is about to begin...</MessageBox>;
  } else if (gameStatus === GameStatus.PreQuestion && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading="⏳ Please wait... ⏳">Get ready for the question!</MessageBox>;
  } else if (gameStatus === GameStatus.AskingQuestion && teamStatus === TeamStatus.Joined) {
    component = <AnswerQuestion question={question} round={round} />;
  } else if (gameStatus === GameStatus.QuestionClosed && teamStatus === TeamStatus.Joined) {
    component = <MessageBox heading="🍀 Good luck! 🍀">Your answer is being scored...</MessageBox>;
  } else if (gameStatus === GameStatus.RoundEnded) {
    component = <MessageBox heading="😁 The round has ended 😁">Please wait for the next round...</MessageBox>;
  } else if (gameStatus === GameStatus.EndGame) {
    component = <MessageBox heading="💯 The quiz has ended 💯">The quiz has ended. Wait to find out the results!</MessageBox>;
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
