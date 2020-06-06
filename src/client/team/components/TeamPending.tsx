import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ClimbingBoxLoader } from 'react-spinners';

import TeamInfo from './TeamInfo';

const TeamPending: React.FC = () => (
  <>
    <TeamInfo />
    <Container>
      <Row className="min-vh-100 h-100">
        <Col xs={{ span: 12 }}>
          <div className="d-flex align-items-center justify-content-center h-75">
            <ClimbingBoxLoader sizeUnit="px" size={35} color="#FFF" loading={true} />
          </div>
          <div className="text-white">
            <div className="col-lg-10 mx-auto text-center">
              <p className="lead">Loading...</p>
              <p className="lead">Please wait for your player code and team name to be accepted.</p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  </>
);

export default TeamPending;
