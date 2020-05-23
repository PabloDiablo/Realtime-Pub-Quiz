import React from 'react';
import { Container, Alert } from 'react-bootstrap';

import HeaderLogo from '../HeaderLogo';

import './styles.css';

interface Props {
  heading: React.ReactNode;
}

const MessageBox: React.FC<Props> = ({ heading, children }) => (
  <Container>
    <div className="message-box__header-wrapper">
      <HeaderLogo />
    </div>

    <Alert className="h-25 d-inline-block w-100" variant="light">
      <Alert.Heading className="text-center">{heading}</Alert.Heading>
      <div className="text-center">{children}</div>
    </Alert>
  </Container>
);

export default MessageBox;
