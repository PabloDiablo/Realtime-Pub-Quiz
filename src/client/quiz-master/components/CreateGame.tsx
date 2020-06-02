import React, { useState } from 'react';
import { Container, Form, Col, Row, Button, Card } from 'react-bootstrap';

import HeaderLogo from '../../shared/components/HeaderLogo';
import { postNewGame } from '../services/quiz-master';
import { useStateContext, ActionTypes } from '../state/context';
import { GameStatus } from '../../../shared/types/status';
import { openRealtimeDbConnection } from '../state/realtime-db';

const CreateGame: React.FC = () => {
  const { dispatch } = useStateContext();

  const [gameRoomName, setGameRoomName] = useState<string>();
  const [passcode, setPasscode] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    setHasError(false);
    setIsSubmitting(true);

    const res = await postNewGame(gameRoomName, passcode);

    if (res.success && res.gameRoomNameAccepted) {
      dispatch({ type: ActionTypes.SetGameRoom, gameRoom: res.gameRoomName });
      dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.Lobby });
      openRealtimeDbConnection({ gameRoom: gameRoomName }, dispatch);
    } else {
      setHasError(true);
    }

    setIsSubmitting(false);
  };

  return (
    <Container>
      <Row className="min-vh-100">
        <HeaderLogo />
        <Col md={{ span: 8, offset: 2 }} className="h-100">
          <Form onSubmit={handleSubmit}>
            <Card bg="dark" border="danger" text="white">
              <Card.Header>Make a new quiz</Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Enter the game room name here</Form.Label>
                  <Form.Control
                    onChange={e => {
                      setGameRoomName(e.target.value);
                    }}
                    type="text"
                    placeholder="Game room name"
                    className={hasError ? 'is-invalid' : ''}
                    autoComplete="off"
                    required
                  />
                  <div className="invalid-feedback">Game room already exists or your passcode is wrong</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Passcode</Form.Label>
                  <Form.Control
                    onChange={e => {
                      setPasscode(e.target.value);
                    }}
                    type="text"
                    placeholder="Passcode"
                    autoComplete="off"
                  />
                </Form.Group>
                <Button variant="danger" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Create game'}
                </Button>
              </Card.Body>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateGame;
