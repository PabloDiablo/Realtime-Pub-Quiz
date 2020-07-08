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
  isSaving: boolean;
  gameRoomName: string;
  teamName: string;
  playerCode: string;
  error: string;
}

class NewTeam extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const pathParts = window.location.pathname.split('/');

    this.state = {
      isSaving: false,
      gameRoomName: '',
      teamName: '',
      playerCode: pathParts && pathParts[1] ? pathParts[1] : '',
      error: ''
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

    this.setState({ error: '' });

    if (!this.state.gameRoomName || !this.state.teamName || !this.state.playerCode) {
      this.setState({ error: "Looks like you didn't enter all the details. Please check and try again." });

      return;
    }

    this.setState({ isSaving: true });

    const res = await postJoinGame({
      gameRoom: this.state.gameRoomName,
      teamName: this.state.teamName,
      playerCode: this.state.playerCode
    });

    if (res.success) {
      if (res.errorReason === JoinGameErrorReason.Ok) {
        this.setTeamName(this.state.teamName);
        openRealtimeDbConnection({ gameId: res.gameRoom, teamId: res.teamId }, this.props.dispatch);
      } else if (res.errorReason === JoinGameErrorReason.GameRoomNotFound) {
        this.setState({ error: "The game room you entered doesn't exist. Please check and try again." });
      } else if (res.errorReason === JoinGameErrorReason.PlayerCodeInvalid) {
        this.setState({ error: "We didn't recognise that player code. Please check and try again." });
      } else if (res.errorReason === JoinGameErrorReason.TeamNameTaken) {
        this.setState({ error: 'That team name is already taken! Please pick a different name and try again.' });
      } else if (res.errorReason === JoinGameErrorReason.MissingValues) {
        this.setState({ error: "Looks like you didn't enter all the details. Please check and try again." });
      }
    } else {
      this.setState({ error: 'There was a problem joining the game. Please check your internet connection and try again.' });
    }

    this.setState({ isSaving: false });
  };

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
                  {this.state.error && <div className="form-error-msg">{this.state.error}</div>}
                  <Form onSubmit={this.handleSubmit}>
                    <Form.Group>
                      <Form.Label>Enter the quiz code here</Form.Label>
                      <Form.Control
                        type="text"
                        value={this.state.gameRoomName}
                        onChange={this.onChangeGameRoomName}
                        placeholder="Quiz code"
                        autoComplete="off"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Enter your unique player code</Form.Label>
                      <Form.Control type="text" value={this.state.playerCode} onChange={this.onChangePlayerCode} placeholder="Player code" autoComplete="off" />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Enter your team name</Form.Label>
                      <Form.Control type="text" value={this.state.teamName} onChange={this.onChangeTeamName} placeholder="Team name" autoComplete="off" />
                    </Form.Group>
                    <Button variant="success" type="submit" block disabled={this.state.isSaving}>
                      {this.state.isSaving ? 'Joining...' : 'Join Game'}
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
