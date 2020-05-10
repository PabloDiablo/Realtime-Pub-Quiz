import React from 'react';
import * as ReactRedux from 'react-redux';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import HeaderLogo from '../shared/HeaderLogo';
import { endGame, startRound } from '../../websocket';

interface Props {
  gameRoom: string;
}

class EndOfRound extends React.Component<Props> {
  render() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderLogo />
          <Col md={{ span: 12 }} className={'text-white text-center'}>
            <Card text="dark">
              <Card.Body className={'text-center'}>
                <h1 className={'py-4'}>What next?</h1>
                <Button
                  className={'float-left'}
                  variant="danger"
                  type="submit"
                  onClick={() => {
                    endGame(this.props.gameRoom);
                  }}
                >
                  End the game
                </Button>

                <Button
                  className={'float-right'}
                  variant="success"
                  type="submit"
                  onClick={() => {
                    startRound(this.props.gameRoom, undefined);
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
  }
}

function mapStateToProps(state) {
  return {
    gameRoom: state.createGame.gameRoom
  };
}

export default ReactRedux.connect(mapStateToProps)(EndOfRound);
