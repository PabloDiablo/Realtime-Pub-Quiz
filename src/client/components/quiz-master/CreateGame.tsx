import React from 'react';
import * as ReactRedux from 'react-redux';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

import { httpHostname } from '../../config';
import { createGameRoomAction, createGameFormValidationAction, createCurrentGameStatusAction } from '../../action-reducers/createGame-actionReducer';
import Lobby from './Lobby';
import { openWebSocket } from '../../websocket';
import HeaderLogo from '../shared/HeaderLogo';

interface Props {
  formValidation: string;
  currentGameStatus: string;
  doChangeGameFormValidation(formValidation: string): void;
  doChangeGameRoom(gameRoom: string): void;
  doChangeGameStatus(currentGameStatus: string): void;
}

interface State {
  gameRoomName: string;
  passcode: string;
}

class CreateGame extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      gameRoomName: '',
      passcode: ''
    };
  }

  onChangeGameRoomName = e => {
    this.setState({
      gameRoomName: e.target.value
    });
  };

  onChangePasscode = e => {
    this.setState({
      passcode: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();

    const url = `${httpHostname}/api/game`;
    const data = {
      gameRoomName: this.state.gameRoomName,
      passcode: this.state.passcode
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
        if (data.gameRoomNameAccepted === true) {
          this.props.doChangeGameFormValidation('success');
          this.props.doChangeGameRoom(data.gameRoomName);
          this.props.doChangeGameStatus('in_lobby');
          openWebSocket();
        } else if (data.gameRoomNameAccepted === false || data.passcodeIncorrect === true) {
          this.props.doChangeGameFormValidation('error');
        }
      })
      .catch(err => console.log(err));
  };

  errorMessage() {
    if (this.props.formValidation === 'error') {
      return 'is-invalid';
    }
  }

  createGameForm() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderLogo />
          <Col md={{ span: 8, offset: 2 }} className="h-100">
            <Form onSubmit={this.handleSubmit}>
              <Card bg="dark" border="danger" text="white">
                <Card.Header>Make a new quiz</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Enter the game room name here</Form.Label>
                    <Form.Control
                      value={this.state.gameRoomName}
                      onChange={this.onChangeGameRoomName}
                      type="text"
                      placeholder="Game room name"
                      className={this.errorMessage()}
                      autoComplete="off"
                      required
                    />
                    <div className="invalid-feedback">Game room already exists or your passcode is wrong</div>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Passcode</Form.Label>
                    <Form.Control value={this.state.passcode} onChange={this.onChangePasscode} type="text" placeholder="Passcode" autoComplete="off" />
                  </Form.Group>
                  <Button variant="danger" type="submit">
                    Create game
                  </Button>
                  <Link to="/" className="btn btn-link">
                    Cancel
                  </Link>
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }

  render() {
    if (this.props.formValidation === 'success' && this.props.currentGameStatus !== 'end_game') {
      return (
        <div>
          <Lobby />
        </div>
      );
    } else {
      return <div>{this.createGameForm()}</div>;
    }
  }
}

function mapStateToProps(state) {
  return {
    formValidation: state.createGame.formValidation,
    gameRoom: state.createGame.gameRoom,
    currentGameStatus: state.createGame.currentGameStatus
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doChangeGameFormValidation: formValidation => dispatch(createGameFormValidationAction(formValidation)),
    doChangeGameRoom: gameRoom => dispatch(createGameRoomAction(gameRoom)),
    doChangeGameStatus: currentGameStatus => dispatch(createCurrentGameStatusAction(currentGameStatus))
  };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(CreateGame);
