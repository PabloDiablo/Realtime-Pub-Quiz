import React from 'react';
import { Card, Table, Container, Col, Row, Accordion, Button } from 'react-bootstrap';

import { Scores } from '../../types';

import './styles.css';

type Props = Pick<Scores, 'rounds' | 'teams'>;

interface ScoreTableProps {
  scores: Record<string, number>;
}

const convertAndSortScores = (obj: Record<string, number>) =>
  Object.keys(obj)
    .map(team => ({
      teamName: team,
      position: obj[team]
    }))
    .sort((a, b) => b.position - a.position);

const getAnswerEmoji = (isCorrect?: boolean): string => {
  if (isCorrect === undefined) {
    return '-';
  }

  return isCorrect ? '✅' : '❌';
};

const ScoreTable: React.FC<ScoreTableProps> = ({ scores }) => {
  const positions = convertAndSortScores(scores);

  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
        </tr>
      </thead>
      <tbody>
        {positions.map(pos => (
          <tr key={pos.teamName}>
            <td>{pos.position}</td>
            <td>{pos.teamName}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const ScoresTable: React.FC<Props> = ({ rounds, teams }) => {
  return (
    <Container>
      <Row className="min-vh-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card>
            <Card.Body>
              <Card.Title>Current Positions</Card.Title>
              <ScoreTable scores={teams} />
            </Card.Body>
          </Card>

          {Object.values(rounds).map((round, index) => (
            <Card key={index}>
              <Card.Body>
                <Card.Title>
                  Round {index + 1}: {round.category}
                </Card.Title>
                <Card.Title>Questions: {round.questionsCount}</Card.Title>
                <div>
                  <b>Round Scores</b>
                  <ScoreTable scores={round.teamTotals} />
                </div>
                <Accordion>
                  <Accordion.Toggle as={Button} eventKey={`${index}`}>
                    Show Questions
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={`${index}`}>
                    <div>
                      {round.questions.map((q, idx) => (
                        <div key={idx}>
                          <h3>
                            {idx + 1}: {q.question}
                          </h3>
                          <b>{q.answer}</b>
                          <div>
                            <Table striped bordered hover size="sm">
                              <thead>
                                <tr>
                                  <th>Team</th>
                                  <th>Answer</th>
                                  <th>Correct?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {q.teams.map(t => (
                                  <tr key={t.teamName}>
                                    <td>{t.teamName}</td>
                                    <td>{t.answer}</td>
                                    <td>{getAnswerEmoji(t.isCorrect)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Collapse>
                </Accordion>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default ScoresTable;
