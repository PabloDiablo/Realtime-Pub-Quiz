import React from 'react';
import * as ReactRedux from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ScorebordJoinTeam } from './ScorebordJoinTeam';
import { ScorebordOverzichtScore } from './ScorebordOverzichtScore';

interface RouterMatchParams {
  room: string;
}

interface Props {
  rounds?: any;
  teams?: any;
}

class ScoreboardAppUI extends React.Component<Props & RouteComponentProps<RouterMatchParams>> {
  render() {
    const showScoreboard = this.props.rounds && this.props.teams;

    if (showScoreboard) {
      return <ScorebordOverzichtScore />;
    }

    //If no match, return ScorebordJoinTeam Component
    return <ScorebordJoinTeam gameRoom={this.props.match.params.room} />;
  }
}

function mapStateToProps(state) {
  return {
    formValidationScoreboard: state.createScoreboard.formValidationScoreboard,
    currentGameStatus: state.createGame.currentGameStatus,
    rounds: state.createScoreboard.rounds,
    teams: state.createScoreboard.teams
  };
}

export const ScoreboardApp = ReactRedux.connect(mapStateToProps)(withRouter(ScoreboardAppUI));