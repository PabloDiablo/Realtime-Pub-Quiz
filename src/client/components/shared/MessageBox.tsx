import React from 'react';
import { Container, Row, Alert } from 'react-bootstrap';

import HeaderLogo from '../shared/HeaderLogo';

interface Props {
  heading: React.ReactNode;
}

const MessageBox: React.FC<Props> = ({ heading, children }) => (
  <Container>
    <Row className="min-vh-100">
      <HeaderLogo />
      <Alert className="h-25 d-inline-block w-100" variant="light">
        <Alert.Heading className="text-center">{heading}</Alert.Heading>
        <div className="text-center">{children}</div>
      </Alert>
    </Row>
  </Container>
);

export default MessageBox;
