import React from 'react';
import * as ReactRedux from 'react-redux';
import { Spinner } from 'react-bootstrap';

import TeamCategorieMelding from './TeamCategorieMelding';
import TeamVragen from './TeamVragen';
import { TeamBeantwoordVraag } from './TeamBeantwoordVraag';
import { TeamAanmaken } from './TeamAanmaken';
import TeamQuestionClosed from './TeamVraagGeslotenMelding';
import TeamRondeEindMelding from './TeamRondeEindMelding';
import TeamGameEnded from './TeamGameEndeMelding';
import TeamQuizMasterDcMelding from './TeamQuizMasterDcMelding';
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

class TeamsAppUI extends React.Component<Props, State> {
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
      return <TeamCategorieMelding />;
    }
    if (this.props.currentGameStatus === 'choose_question' && this.props.teamNameStatus === 'success') {
      return <TeamVragen />;
    }
    if (this.props.currentGameStatus === 'asking_question' && this.props.teamNameStatus === 'success') {
      return <TeamBeantwoordVraag />;
    }
    if (this.props.currentGameStatus === 'question_closed' && this.props.teamNameStatus === 'success') {
      return <TeamQuestionClosed />;
    }
    if (this.props.currentGameStatus === 'round_ended') {
      return <TeamRondeEindMelding />;
    }
    if (this.props.currentGameStatus === 'end_game') {
      return <TeamGameEnded />;
    }
    if (this.props.currentGameStatus === 'quizmaster_left') {
      return <TeamQuizMasterDcMelding />;
    }

    //If no match, return QuizzMasterGameAanmaken Component
    return <TeamAanmaken />;
  }
}

function mapStateToProps(state) {
  return {
    currentGameStatus: state.createGame.currentGameStatus,
    teamNameStatus: state.createTeam.teamNameStatus
  };
}

export const TeamsApp = ReactRedux.connect(mapStateToProps)(TeamsAppUI);
