import React from 'react';
import { Container, Col, Row, Button, Form, Card } from 'react-bootstrap';

import HeaderLogo from '../../shared/components/HeaderLogo';
import { TeamStatus } from '../../../shared/types/status';
import { ActionTypes, Action } from '../state/context';
import { openRealtimeDbConnection } from '../state/realtime-db';
import { postJoinGame } from '../services/player';
import { JoinGameErrorReason } from '../../../shared/types/enum';

interface Props {
  teamStatus: TeamStatus;
  teamName: string;
  dispatch(action: Action): void;
}

interface State {
  gameRoomName: string;
  teamName: string;
  playerCode: string;
  isGameRoomAccepted: boolean;
}

class NewTeam extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      gameRoomName: '',
      teamName: '',
      playerCode: '',
      isGameRoomAccepted: true
    };
  }

  setTeamStatus = (newTeamStatus: TeamStatus) => this.props.dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: newTeamStatus });

  setTeamName = (newTeamName: string) => this.props.dispatch({ type: ActionTypes.SetTeamName, teamName: newTeamName });

  onChangeGameRoomName = e => {
    this.setState({
      gameRoomName: e.target.value
    });
  };

  onChangeTeamName = e => {
    this.setState({
      teamName: e.target.value
    });
  };

  onChangePlayerCode = e => {
    this.setState({
      playerCode: e.target.value
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    const res = await postJoinGame({
      gameRoom: this.state.gameRoomName,
      teamName: this.state.teamName,
      playerCode: this.state.playerCode
    });

    if (res.success) {
      if (res.errorReason === JoinGameErrorReason.Ok) {
        this.setTeamName(this.state.teamName);
        openRealtimeDbConnection({ gameId: res.gameRoom, teamId: res.teamId }, this.props.dispatch);
      } else {
        this.setState({ isGameRoomAccepted: false });
      }
    } else {
      this.setState({ isGameRoomAccepted: false });
    }
  };

  gameRoomError() {
    if (!this.state.isGameRoomAccepted) {
      return 'is-invalid';
    }
  }

  render() {
    return (
      <div>
        <Container>
          <Row className="min-vh-100">
            <HeaderLogo />
            <Col md={{ span: 8, offset: 2 }} className="h-100">
              <Card bg="dark" border="danger" text="white">
                <Card.Header>Join the quiz</Card.Header>
                <Card.Body>
                  <Form onSubmit={this.handleSubmit}>
                    <Form.Group>
                      <Form.Label>Enter the quiz code here</Form.Label>
                      <Form.Control
                        type="text"
                        value={this.state.gameRoomName}
                        onChange={this.onChangeGameRoomName}
                        className={this.gameRoomError()}
                        placeholder="Quiz code"
                        autoComplete="off"
                      />
                      <div className="invalid-feedback">Huh, this game room doesn't exist 😨</div>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Enter your unique player code</Form.Label>
                      <Form.Control
                        type="text"
                        value={this.state.playerCode}
                        onChange={this.onChangePlayerCode}
                        className={this.gameRoomError()}
                        placeholder="Player code"
                        autoComplete="off"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Enter your team name</Form.Label>
                      <Form.Control type="text" value={this.state.teamName} onChange={this.onChangeTeamName} placeholder="Team name" autoComplete="off" />
                      <div className="invalid-feedback">Huh, this team name is already taken - please try another. 😪</div>
                    </Form.Group>
                    <Button variant="danger" type="submit">
                      Send
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default NewTeam;
