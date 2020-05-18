import React from 'react';
import * as ReactRedux from 'react-redux';
import { Button } from 'react-bootstrap';

import { startGame } from '../../../websocket';
import HeaderLogo from '../../shared/HeaderLogo';

import './styles.css';
import TeamActionButtons from './TeamActionButtons';
import { GameRoomTeam } from '../../../types/state';

interface Props {
  gameRoomTeams: GameRoomTeam[];
  gameRoom: string;
}

class Lobby extends React.Component<Props> {
  render() {
    const isGameReady = this.props.gameRoomTeams.some(team => team.approved);

    return (
      <div className="container-fluid px-md-5">
        <div className="row py-5 text-white">
          <HeaderLogo subTitle="This is the quiz master panel" />
        </div>

        <div className="rounded">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="nav flex-column bg-white shadow-sm font-italic rounded p-3">
                <h3 className={'text-center'}>Quiz info</h3>
                <hr />
                <p>
                  <b>Gameroom name:</b> {this.props.gameRoom}
                </p>
                <Button
                  variant="outline-success"
                  type="submit"
                  disabled={!isGameReady}
                  onClick={() => {
                    startGame(this.props.gameRoom);
                  }}
                >
                  Start quiz
                </Button>
              </div>
            </div>

            <div className="col-lg-8 mb-5">
              <div className="lobby__list-container">
                <div className="lobby__list-label">Teams</div>
                <div className="lobby__list"></div>
                {this.props.gameRoomTeams.map(team => (
                  <div key={team._id} className="lobby__list-item">
                    <div className="lobby__list-item-label">
                      {team.name} [{team.playerCode}]
                    </div>
                    <div className="lobby__list-item-buttons">
                      <TeamActionButtons team={team} gameRoom={this.props.gameRoom} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    gameRoom: state.createGame.gameRoom,
    gameRoomTeams: state.createGame.gameRoomTeams,
    currentGameStatus: state.createGame.currentGameStatus
  };
}

export default ReactRedux.connect(mapStateToProps)(Lobby);
