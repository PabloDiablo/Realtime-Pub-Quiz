import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';

import AnswerQuestion from './AnswerQuestion';
import NewTeam from './NewTeam';
import MessageBox from '../shared/MessageBox';

import { getHasSession } from '../../services/player';
import { useStateContext, ActionTypes } from '../../state/context';
import { GameStatus, TeamStatus } from '../../../shared/types/status';

const TeamApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    state: { gameStatus, teamStatus, question },
    dispatch
  } = useStateContext();

  useEffect(() => {
    const hasSession = async () => {
      setIsLoading(true);
      const res = await getHasSession();

      if (res.success && res.hasSession) {
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: res.gameStatus });
        dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: res.teamStatus });

        if (res.question) {
          dispatch({ type: ActionTypes.SetQuestion, question: res.question });
        }
      }

      setIsLoading(false);
    };

    hasSession();
  }, [dispatch]);

  const setTeamStatus = (teamStatus: TeamStatus) => dispatch({ type: ActionTypes.SetTeamStatus, teamStatus });

  if (isLoading) {
    return (
      <MessageBox heading="Loading...">
        <Spinner animation="border" />
      </MessageBox>
    );
  }

  if (gameStatus === GameStatus.ChooseCategory && teamStatus === TeamStatus.Success) {
    return <MessageBox heading="⏳ Please wait... ⏳">The round is about to begin...</MessageBox>;
  }

  if (gameStatus === GameStatus.ChooseQuestion && teamStatus === TeamStatus.Success) {
    return <MessageBox heading="⏳ Please wait... ⏳">Get ready for the question!</MessageBox>;
  }

  if (gameStatus === GameStatus.AskingQuestion && teamStatus === TeamStatus.Success) {
    return <AnswerQuestion question={question} />;
  }

  if (gameStatus === GameStatus.QuestionClosed && teamStatus === TeamStatus.Success) {
    return <MessageBox heading="🍀 Good luck! 🍀">Your answer is being scored...</MessageBox>;
  }

  if (gameStatus === GameStatus.RoundEnded) {
    return <MessageBox heading="😁 The round has ended 😁">Please wait for the next round...</MessageBox>;
  }

  if (gameStatus === GameStatus.EndGame) {
    return <MessageBox heading="💯 The round has ended 💯">The quiz has ended. Wait to find out the results!</MessageBox>;
  }

  if (gameStatus === GameStatus.QuizMasterLeft) {
    return <MessageBox heading="The quiz has unexpectedly stopped ☠️">Please wait for it to reconnect...</MessageBox>;
  }

  return <NewTeam teamStatus={teamStatus} setTeamStatus={setTeamStatus} />;
};

export default TeamApp;
