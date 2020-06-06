import React from 'react';
import { Container, Col, Row, Button, Form, Card } from 'react-bootstrap';
import { store } from 'react-notifications-component';

import 'react-notifications-component/dist/theme.css';

import HeaderLogo from '../../shared/components/HeaderLogo';
import { httpHostname } from '../../config';
import { TeamStatus } from '../../../shared/types/status';
import { ActionTypes, Action } from '../state/context';
import { openRealtimeDbConnection } from '../state/realtime-db';

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

  componentDidUpdate() {
    if (this.props.teamStatus === 'deleted') {
      store.addNotification({
        title: 'Quizzer',
        message: "We're sorry - your player code or team name wasn't accepted. Please double check your player code or try a different team name!",
        type: 'danger', // 'default', 'success', 'info', 'warning'
        container: 'top-right', // where to position the notifications
        animationIn: ['animated', 'fadeIn'], // animate.css classes that's applied
        animationOut: ['animated', 'fadeOut'], // animate.css classes that's applied
        dismiss: {
          duration: 6000
        }
      });

      this.setTeamStatus(TeamStatus.New);
    }
  }

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

  handleSubmit = e => {
    e.preventDefault();

    const url = `${httpHostname}/api/team`;

    const data = {
      gameRoomName: this.state.gameRoomName,
      teamName: this.state.teamName,
      playerCode: this.state.playerCode
    };

    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        if (data.gameRoomAccepted) {
          this.setState({ isGameRoomAccepted: true });
          this.setTeamName(data.teamName);
          if (data.teamNameStatus === 'pending') {
            this.setTeamStatus(data.teamNameStatus);
          } else if (data.teamNameStatus === 'error') {
            this.setTeamStatus(TeamStatus.Error);
          }

          openRealtimeDbConnection({ gameRoom: data.gameRoomName, rdbTeamId: data.rdbTeamId }, this.props.dispatch);
        } else {
          this.setState({ isGameRoomAccepted: false });
        }
      });
  };

  gameRoomError() {
    if (!this.state.isGameRoomAccepted) {
      return 'is-invalid';
    }
  }

  teamNameError() {
    if (this.props.teamStatus === TeamStatus.Error) {
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
                      <div className="invalid-feedback">
                        Huh, this game room doesn't exist
                        <span role={'img'} aria-label={'sad'}>
                          😨
                        </span>
                      </div>
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
                      <Form.Control
                        type="text"
                        value={this.state.teamName}
                        onChange={this.onChangeTeamName}
                        className={this.teamNameError()}
                        placeholder="Team name"
                        autoComplete="off"
                      />
                      <div className="invalid-feedback">
                        Huh, this team name is already taken - please try another.
                        <span role={'img'} aria-label={'sad'}>
                          😪
                        </span>
                      </div>
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
