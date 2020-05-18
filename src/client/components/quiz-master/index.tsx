import React from 'react';
import * as ReactRedux from 'react-redux';

import ChooseCategories from './ChooseCategories';
import ChooseQuestion from './ChooseQuestion';
import MarkTeamAnswers from './MarkTeamAnswers';
import CreateGame from './CreateGame';
import Lobby from './Lobby';
import EndOfRound from './EndOfRound';
import LatePlayer from './LatePlayer';
import { removeLatePlayerFromQueue } from '../../action-reducers/createGame-actionReducer';

interface Props {
  currentGameStatus: string;
  gameRoom: string;
  latePlayersQueue: {
    teamName: string;
    playerCode: string;
    teamId: string;
  }[];
  doRemoveLatePlayerFromQueue(teamName: string): void;
}

class QuizMaster extends React.Component<Props> {
  componentDidMount() {
    // Refreshing quiz master page will force local storage to clear, it's probably possible to retain it
    // but I can't figure it out right now, `theSocket` seems to be undefined on refresh.
    if (localStorage.getItem('state')) {
      localStorage.clear();
      location.reload();
    }

    window.onbeforeunload = (e: BeforeUnloadEvent) => {
      // Cancel the event
      e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      // Chrome requires returnValue to be set
      e.returnValue = '';
    };
  }

  renderComponent() {
    if (this.props.currentGameStatus === 'in_lobby') {
      return <Lobby />;
    }
    if (this.props.currentGameStatus === 'choose_categories') {
      return <ChooseCategories />;
    }
    if (this.props.currentGameStatus === 'choose_question') {
      return <ChooseQuestion />;
    }
    if (this.props.currentGameStatus === 'asking_question' || this.props.currentGameStatus === 'question_closed') {
      return <MarkTeamAnswers />;
    }
    if (this.props.currentGameStatus === 'round_ended') {
      return <EndOfRound />;
    }
    if (this.props.currentGameStatus === 'end_game') {
      return <CreateGame />;
    }

    //If no match, return QuizzMasterGameAanmaken Component
    return <CreateGame />;
  }

  render() {
    const playerInQueue = this.props.latePlayersQueue[0];

    return (
      <>
        {playerInQueue && <LatePlayer team={playerInQueue} gameRoom={this.props.gameRoom} removeLatePlayerFromQueue={this.props.doRemoveLatePlayerFromQueue} />}
        {this.renderComponent()}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentGameStatus: state.createGame.currentGameStatus,
    gameRoom: state.createGame.gameRoom,
    latePlayersQueue: state.createGame.latePlayersQueue
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doRemoveLatePlayerFromQueue: teamName => dispatch(removeLatePlayerFromQueue(teamName))
  };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(QuizMaster);
