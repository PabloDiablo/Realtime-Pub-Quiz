import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import HeaderTitel from '../HeaderTitel';

export class TeamCategorieMelding extends React.Component {
  render() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderTitel />
          <Alert className={'h-25 d-inline-block w-100'} variant="light">
            <Alert.Heading className={'text-center'}>
              <span role="img" aria-label="loader">
                ⏳
              </span>{' '}
              Please wait...{' '}
              <span role="img" aria-label="loader">
                ⏳
              </span>
            </Alert.Heading>
            <p className={'text-center'}>The Quiz Master is about to start the round...</p>
          </Alert>
        </Row>
      </Container>
    );
  }
}

export default TeamCategorieMelding;
