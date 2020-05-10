import React from 'react';
import { httpHostname } from '../../config';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { createGameRoomStatusAction, createTeamNameStatusAction, getTeamNameAction, getGameNameAction } from '../../action-reducers/createTeam-actionReducer';
import * as ReactRedux from 'react-redux';
import { openWebSocket, sendNewTeamMSG, setSessionId } from '../../websocket';
import { ClimbingBoxLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import 'react-notifications-component/dist/theme.css';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import Card from 'react-bootstrap/Card';
import HeaderLogo from '../shared/HeaderLogo';

interface Props {
  teamNameStatus: string;
  gameRoomAccepted: boolean;
  teamRoomName: string;
  gameRoomName: string;
  currentGameStatus: string;
  roundNumber: string;
  doChangeGameRoomStatus(gameRoomAccepted: boolean): void;
  doChangeTeamNameStatus(teamNameStatus: string): void;
  doChangeTeamName(teamName: string): void;
  doChangeGameRoom(gameRoomName: string): void;
}

interface State {
  gameRoomName: string;
  teamName: string;
  playerCode: string;
}

class TeamAanmakenUI extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      gameRoomName: '',
      teamName: '',
      playerCode: ''
    };
  }

  componentDidUpdate() {
    if (this.props.teamNameStatus === 'deleted') {
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
      this.props.doChangeTeamNameStatus('');
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
        if (data.gameRoomAccepted === true) {
          this.props.doChangeGameRoomStatus(data.gameRoomAccepted);
          if (data.teamNameStatus === 'pending') {
            this.props.doChangeTeamNameStatus(data.teamNameStatus);
            this.props.doChangeTeamName(data.teamName);
            this.props.doChangeGameRoom(data.gameRoomName);
            setSessionId(data.id);
            openWebSocket(); //open websocket connection
            sendNewTeamMSG(); //send message createTeam
          } else if (data.teamNameStatus === 'error') {
            this.props.doChangeTeamNameStatus(data.teamNameStatus);
          } else if (data.teamNameStatus === 'already-started') {
            this.props.doChangeTeamNameStatus(data.teamNameStatus);
          }
        } else if (data.gameRoomAccepted === false) {
          this.props.doChangeGameRoomStatus(data.gameRoomAccepted);
        }
      });
  };

  gameRoomAlreadyStarted(errorMelding) {
    if (this.props.teamNameStatus === 'already-started') {
      return errorMelding;
    }
  }

  gameRoomError() {
    if (this.props.gameRoomAccepted === false) {
      return 'is-invalid';
    }
  }

  teamNameError() {
    if (this.props.teamNameStatus === 'error') {
      return 'is-invalid';
    }
  }

  // Deze fucntie wordt in geladen als team status pending is
  loadingAnimation() {
    return (
      <Container>
        <Row className="min-vh-100 h-100">
          <Col xs={{ span: 12 }}>
            <div className="d-flex align-items-center justify-content-center h-75">
              <ClimbingBoxLoader sizeUnit={'px'} size={35} color={'#FFF'} loading={true} />
            </div>
            <div className="text-white">
              <div className="col-lg-10 mx-auto text-center">
                <p className="lead">Loading...</p>
                <p className="lead">Please wait for your player code and team name to be accepted.</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // Deze fucntie wordt in geladen als team status niet geset is
  joinGameForm() {
    return (
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
                  <div className={'text-danger'}>{this.gameRoomAlreadyStarted('The game has already begun! 😨')}</div>
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
                  <Link to="/" className="btn btn-link">
                    Cancel
                  </Link>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Deze fucntie wordt in geladen als team status success is
  teamAccepted() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderLogo />
          <Alert className={'h-25 d-inline-block w-100'} variant="light">
            <Alert.Heading className={'text-center'}>
              <strong>{this.props.teamRoomName}</strong> - your player code and team name has been accepted!{' '}
              <span role="img" aria-label="success">
                👍
              </span>
            </Alert.Heading>
            <p className={'text-center'}>Please wait for the quiz to begin...</p>
          </Alert>
        </Row>
      </Container>
    );
  }

  checkTeamNameStatus() {
    if (this.props.teamNameStatus === 'pending') {
      return this.loadingAnimation();
    } else if (this.props.teamNameStatus === 'success') {
      return this.teamAccepted();
    } else {
      return this.joinGameForm();
    }
  }

  render() {
    return <div>{this.checkTeamNameStatus()}</div>;
  }
}

function mapStateToProps(state) {
  return {
    gameRoomAccepted: state.createTeam.gameRoomAccepted,
    teamNameStatus: state.createTeam.teamNameStatus,
    teamRoomName: state.createTeam.teamRoomName,
    gameRoomName: state.createTeam.gameRoomName,
    currentGameStatus: state.createGame.currentGameStatus,
    roundNumber: state.createGame.roundNumber
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doChangeGameRoomStatus: gameRoomAccepted => dispatch(createGameRoomStatusAction(gameRoomAccepted)),
    doChangeTeamNameStatus: teamNameStatus => dispatch(createTeamNameStatusAction(teamNameStatus)),
    doChangeTeamName: teamName => dispatch(getTeamNameAction(teamName)),
    doChangeGameRoom: gameRoomName => dispatch(getGameNameAction(gameRoomName))
  };
}

export const TeamAanmaken = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(TeamAanmakenUI);
