import React from 'react';
import * as ReactRedux from 'react-redux';

import { QuizzMasterCategorieen } from './QuizzMasterCategorieen';
import { QuizzMasterVragen } from './QuizzMasterVragen';
import { QuizzMasterVragenBeheren } from './QuizzMasterVragenBeheren';
import { QuizzMasterGameAanmaken } from './QuizzMasterGameAanmaken';
import { QuizzMasterTeamsBeheren } from './QuizzMasterTeamsBeheren';
import { QuizzMasterEindRonde } from './QuizzMasterEindRonde';
import { removeLatePlayerFromQueue } from '../../action-reducers/createGame-actionReducer';
import LatePlayer from './LatePlayer';

interface Props {
  currentGameStatus: string;
  gameRoom: string;
  latePlayersQueue: string[];
  doRemoveLatePlayerFromQueue(teamName: string): void;
}

class QuizMasterAppUI extends React.Component<Props> {
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
      return <QuizzMasterTeamsBeheren />;
    }
    if (this.props.currentGameStatus === 'choose_categories') {
      return <QuizzMasterCategorieen />;
    }
    if (this.props.currentGameStatus === 'choose_question') {
      return <QuizzMasterVragen />;
    }
    if (this.props.currentGameStatus === 'asking_question' || this.props.currentGameStatus === 'question_closed') {
      return <QuizzMasterVragenBeheren />;
    }
    if (this.props.currentGameStatus === 'round_ended') {
      return <QuizzMasterEindRonde />;
    }
    if (this.props.currentGameStatus === 'end_game') {
      return <QuizzMasterGameAanmaken />;
    }

    //If no match, return QuizzMasterGameAanmaken Component
    return <QuizzMasterGameAanmaken />;
  }

  render() {
    const playerInQueue = this.props.latePlayersQueue[0];

    return (
      <>
        {playerInQueue && (
          <LatePlayer teamName={playerInQueue} gameRoom={this.props.gameRoom} removeLatePlayerFromQueue={this.props.doRemoveLatePlayerFromQueue} />
        )}
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

export const QuizMasterApp = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(QuizMasterAppUI);
