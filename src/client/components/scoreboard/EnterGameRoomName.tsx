import React, { useState } from 'react';
import { Container, Col, Row, Form, Button, Card } from 'react-bootstrap';

import './styles.css';

interface Props {
  setData(gameRoom: string, passcode: string): void;
}

const EnterGameRoomName: React.FC<Props> = ({ setData }) => {
  const [gameRoom, setGameRoom] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    if (gameRoom && gameRoom.length > 0) {
      setData(gameRoom, passcode);
    }
  };

  const onChangeGameRoomName = e => {
    setGameRoom(e.target.value);
  };

  const onChangePasscode = e => {
    setPasscode(e.target.value);
  };

  return (
    <Container>
      <Row className="min-vh-100">
        <Col md={{ span: 8, offset: 2 }} className="h-100">
          <Form onSubmit={handleSubmit}>
            <Card bg="dark" border="danger" text="white">
              <Card.Header>View a game</Card.Header>
              <Card.Body>
                <Form.Group controlId="exampleForm.ControlInput1">
                  <Form.Label>Enter the game room name for the game you want to view</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={onChangeGameRoomName}
                    placeholder="Game room name"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlInput2">
                  <Form.Label>Passcode</Form.Label>
                  <Form.Control type="text" onChange={onChangePasscode} placeholder="Passcode" autoComplete="off" autoCapitalize="off" autoCorrect="off" />
                </Form.Group>
                <Button variant="danger" type="submit">
                  View Scoreboard
                </Button>
              </Card.Body>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default EnterGameRoomName;
