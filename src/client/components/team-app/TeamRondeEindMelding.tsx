import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import HeaderLogo from '../shared/HeaderLogo';

export class TeamRondeEindMelding extends React.Component {
  render() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderLogo />
          <Alert className={'h-25 d-inline-block w-100'} variant="light">
            <Alert.Heading className={'text-center'}>
              <span role="img" aria-label="question">
                😁
              </span>{' '}
              The round has ended{' '}
              <span role="img" aria-label="question">
                😁
              </span>
            </Alert.Heading>
            <p className={'text-center'}>Please wait for the next round...</p>
          </Alert>
        </Row>
      </Container>
    );
  }
}

export default TeamRondeEindMelding;
