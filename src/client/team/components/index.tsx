import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';

import AnswerQuestion from './AnswerQuestion';
import NewTeam from './NewTeam';
import MessageBox from '../../shared/components/MessageBox';

import { getHasSession } from '../services/player';
import { useStateContext } from '../state/context';
import { GameStatus, TeamStatus } from '../../../shared/types/status';
import MessagePanel from './MessagePanel';
import TeamInfo from './TeamInfo';
import { openRealtimeDbConnection } from '../state/realtime-db';

const TeamApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    state: { gameStatus, teamStatus, question, teamName },
    dispatch
  } = useStateContext();

  useEffect(() => {
    const hasSession = async () => {
      setIsLoading(true);
      const res = await getHasSession();

      if (res.success && res.hasSession) {
        openRealtimeDbConnection({ gameRoom: res.gameRoom, rdbTeamId: res.rdbTeamId }, dispatch);
      }

      setIsLoading(false);
    };

    hasSession();
  }, [dispatch]);

  if (isLoading) {
    return (
      <MessageBox heading="Loading...">
        <Spinner animation="border" />
      </MessageBox>
    );
  }

  if (gameStatus === GameStatus.Lobby && teamStatus === TeamStatus.Success) {
    const heading = (
      <>
        <strong>{teamName}</strong> - your player code and team name has been accepted! 👍
      </>
    );

    return <MessagePanel heading={heading}>Please wait for the quiz to begin...</MessagePanel>;
  }

  if (gameStatus === GameStatus.ChooseCategory && teamStatus === TeamStatus.Success) {
    return <MessagePanel heading="⏳ Please wait... ⏳">The round is about to begin...</MessagePanel>;
  }

  if (gameStatus === GameStatus.ChooseQuestion && teamStatus === TeamStatus.Success) {
    return <MessagePanel heading="⏳ Please wait... ⏳">Get ready for the question!</MessagePanel>;
  }

  if (gameStatus === GameStatus.AskingQuestion && teamStatus === TeamStatus.Success) {
    return (
      <>
        <TeamInfo />
        <AnswerQuestion question={question} />
      </>
    );
  }

  if (gameStatus === GameStatus.QuestionClosed && teamStatus === TeamStatus.Success) {
    return <MessagePanel heading="🍀 Good luck! 🍀">Your answer is being scored...</MessagePanel>;
  }

  if (gameStatus === GameStatus.RoundEnded) {
    return <MessagePanel heading="😁 The round has ended 😁">Please wait for the next round...</MessagePanel>;
  }

  if (gameStatus === GameStatus.EndGame) {
    return <MessagePanel heading="💯 The round has ended 💯">The quiz has ended. Wait to find out the results!</MessagePanel>;
  }

  if (gameStatus === GameStatus.QuizMasterLeft) {
    return <MessagePanel heading="The quiz has unexpectedly stopped ☠️">Please wait for it to reconnect...</MessagePanel>;
  }

  return <NewTeam teamStatus={teamStatus} teamName={teamName} dispatch={dispatch} />;
};

export default TeamApp;
