import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import HeaderTitel from '../HeaderTitel';
import { clearSession } from '../../websocket';

export class TeamRoundEnded extends React.Component {
  componentDidMount() {
    clearSession();
  }

  render() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderTitel />
          <Alert className={'h-25 d-inline-block w-100'} variant="light">
            <Alert.Heading className={'text-center'}>
              <span role="img" aria-label="end">
                💯
              </span>{' '}
              The quiz has finished{' '}
              <span role="img" aria-label="success">
                💯
              </span>
            </Alert.Heading>
            <p className={'text-center'}>The quiz master has ended the game. Wait to find out the results!</p>
          </Alert>
        </Row>
      </Container>
    );
  }
}

export default TeamRoundEnded;
