import React from 'react';
import * as ReactRedux from 'react-redux';
import { Spinner } from 'react-bootstrap';

import AnswerQuestion from './AnswerQuestion';
import NewTeam from './NewTeam';
import MessageBox from '../shared/MessageBox';

import { openWebSocket } from '../../websocket';
import { getHasSession } from '../../services/player';

interface Props {
  currentGameStatus: string;
  teamNameStatus: string;
  forceNewGame?: boolean;
}

interface State {
  isLoading: boolean;
}

function clearState() {
  try {
    localStorage.removeItem('state');
  } catch (err) {}
}

class TeamsApp extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    if (this.props.forceNewGame) {
      clearState();
      location.href = '/';
    }

    const hasSession = async () => {
      this.setState({ isLoading: true });
      const res = await getHasSession();

      if (res.success && res.hasSession) {
        openWebSocket();
      } else {
        clearState();
      }

      this.setState({ isLoading: false });
    };

    hasSession();
  }

  render() {
    if (this.state.isLoading) {
      return (
        <MessageBox heading="Loading...">
          <Spinner animation="border" />
        </MessageBox>
      );
    }

    if (this.props.currentGameStatus === 'choose_categories' && this.props.teamNameStatus === 'success') {
      return <MessageBox heading="⏳ Please wait... ⏳">The round is about to begin...</MessageBox>;
    }

    if (this.props.currentGameStatus === 'choose_question' && this.props.teamNameStatus === 'success') {
      return <MessageBox heading="⏳ Please wait... ⏳">Get ready for the question!</MessageBox>;
    }

    if (this.props.currentGameStatus === 'asking_question' && this.props.teamNameStatus === 'success') {
      return <AnswerQuestion />;
    }
    if (this.props.currentGameStatus === 'question_closed' && this.props.teamNameStatus === 'success') {
      return <MessageBox heading="🍀 Good luck! 🍀">Your answer is being scored...</MessageBox>;
    }
    if (this.props.currentGameStatus === 'round_ended') {
      return <MessageBox heading="😁 The round has ended 😁">Please wait for the next round...</MessageBox>;
    }
    if (this.props.currentGameStatus === 'end_game') {
      return <MessageBox heading="💯 The round has ended 💯">The quiz has ended. Wait to find out the results!</MessageBox>;
    }
    if (this.props.currentGameStatus === 'quizmaster_left') {
      return <MessageBox heading="😓 The quiz has unexpectedly ended! 😓" />;
    }

    return <NewTeam />;
  }
}

function mapStateToProps(state) {
  return {
    currentGameStatus: state.createGame.currentGameStatus,
    teamNameStatus: state.createTeam.teamNameStatus
  };
}

export default ReactRedux.connect(mapStateToProps)(TeamsApp);
