import React from "react";
import * as ReactRedux from "react-redux";
import { ScorebordJoinTeam } from "./ScorebordJoinTeam";
import { ScorebordOverzichtScore } from "./ScorebordOverzichtScore";

class ScoreboardAppUI extends React.Component {
  render() {
    const showScoreboard = this.props.rounds && this.props.teams;

    if (showScoreboard) {
      return <ScorebordOverzichtScore />;
    }

    //If no match, return ScorebordJoinTeam Component
    return <ScorebordJoinTeam />;
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

export const ScoreboardApp = ReactRedux.connect(mapStateToProps)(
  ScoreboardAppUI
);
