import React from 'react';
import { Container, Col, Row, Button, Card } from 'react-bootstrap';

import HeaderLogo from '../../shared/components/HeaderLogo';
import { endGame, startRound } from '../services/websocket';

const EndOfRound = () => (
  <Container>
    <Row className="min-vh-100">
      <HeaderLogo />
      <Col md={{ span: 12 }} className="text-white text-center">
        <Card text="dark">
          <Card.Body className="text-center">
            <h1 className="py-4">What next?</h1>
            <Button
              className="float-left"
              variant="danger"
              type="submit"
              onClick={() => {
                endGame();
              }}
            >
              End the game
            </Button>

            <Button
              className="float-right"
              variant="success"
              type="submit"
              onClick={() => {
                startRound();
              }}
            >
              Another round
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default EndOfRound;
