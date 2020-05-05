import React from 'react';
import * as ReactRedux from 'react-redux';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { Card } from 'react-bootstrap';
import { acceptTeam, deleteTeam, startGame } from '../../websocket';
import Badge from 'react-bootstrap/Badge';
import HeaderTitel from '../HeaderTitel';

interface GameRoomTeam {
  approved: boolean;
  _id: string;
}

interface Props {
  gameRoomTeams: GameRoomTeam[];
  gameRoom: string;
}

class TeamsBeherenUI extends React.Component<Props> {
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
              <Card.Title className="text-center">{teamName['_id']}</Card.Title>
              {teamStatus}
            </Card.Body>
          </Card>
        </Col>
      );
    });
  }

  startGameButton() {
    let button = null;
    if (this.props.gameRoomTeams.length > 0) {
      this.props.gameRoomTeams.map(teamName => {
        if (teamName['approved']) {
          button = (
            <Button
              variant="outline-success"
              type="submit"
              onClick={() => {
                startGame(this.props.gameRoom);
              }}
            >
              Start quiz
            </Button>
          );
        }
      });
    }
    return button;
  }

  render() {
    return (
      <div className="container-fluid px-md-5">
        <div className="row py-5 text-white">
          <HeaderTitel subTitle="This is the quiz master panel" />
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
                {this.startGameButton()}
              </div>
            </div>

            <div className="col-lg-8 mb-5">
              <div className="p-5 bg-white d-flex align-items-center shadow-sm rounded h-100">
                <div className="demo-content">
                  <p className="lead font-italic">
                    <b>- Teams</b>
                  </p>
                  <Row>{this.getTeams()}</Row>
                </div>
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

export const QuizzMasterTeamsBeheren = ReactRedux.connect(mapStateToProps)(TeamsBeherenUI);
