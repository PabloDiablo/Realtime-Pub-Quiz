import React from 'react';
import * as ReactRedux from 'react-redux';
import { Card, Col, Button, Badge } from 'react-bootstrap';

import { acceptTeam, deleteTeam, startGame } from '../../../websocket';
import HeaderLogo from '../../shared/HeaderLogo';

import './styles.css';
import TeamActionButtons from './TeamActionButtons';
import { GameRoomTeam } from '../../../types/state';

interface Props {
  gameRoomTeams: GameRoomTeam[];
  gameRoom: string;
}

class Lobby extends React.Component<Props> {
  getTeams() {
    return this.props.gameRoomTeams.map((teamName, i) => {
      let teamStatus;
      if (teamName['approved']) {
        teamStatus = (
          <div className="text-center">
            <Badge pill variant="success">
              Accepted
            </Badge>
          </div>
        );
      } else {
        teamStatus = (
          <div>
            <Card.Text className="text-center">Accept team?</Card.Text>
            <Button
              variant="success"
              className={'float-left'}
              onClick={() => {
                acceptTeam(this.props.gameRoom, teamName['_id']);
              }}
            >
              Yes
            </Button>
            <Button
              variant="danger"
              className={'float-right'}
              onClick={() => {
                deleteTeam(this.props.gameRoom, teamName['_id']);
              }}
            >
              No
            </Button>
          </div>
        );
      }

      return (
        <Col key={teamName['_id']}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">
                {teamName['_id']} [{teamName.playerCode}]
              </Card.Title>
              {teamStatus}
            </Card.Body>
          </Card>
        </Col>
      );
    });
  }

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
                      {team._id} [{team.playerCode}]
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
