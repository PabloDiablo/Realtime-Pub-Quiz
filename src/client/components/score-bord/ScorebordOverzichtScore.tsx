import React from 'react';
import * as ReactRedux from 'react-redux';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Card, Table } from 'react-bootstrap';
import HeaderTitel from '../HeaderTitel';

interface TeamScoreboard {
  _id: string;
  round_score: number;
  team_score: number;
}

interface TeamScore {
  teamName: string;
  answer: string;
  isCorrect?: boolean;
}

interface QuestionScore {
  question: string;
  answer: string;
  teams: TeamScore[];
}

interface RoundScore {
  category: string;
  questionsCount: number;
  teamTotals: Record<string, number>;
  questions: QuestionScore[];
}

interface Props {
  currentTeamsScoreboard: TeamScoreboard[];
  teams: Record<string, number>;
  rounds: Record<number, RoundScore>;
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

class ScorebordOverzichtScoreUI extends React.Component<Props> {
  getTeams() {
    return this.props.currentTeamsScoreboard.map(teamName => {
      let vraag = teamName.round_score === 1 ? 'question' : 'questions';
      return (
        <Col md={{ span: 6 }} key={teamName._id}>
          <Card>
            <Card.Body>
              <Card.Title>
                <strong>{teamName._id}</strong>
              </Card.Title>
              <Card.Text>
                Team score: <strong>{teamName.team_score}</strong>
              </Card.Text>
              <Card.Text>
                This round <strong>{teamName.round_score}</strong> {vraag} out of 12 correct
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      );
    });
  }

  renderScoreTable(scores: Record<string, number>) {
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
  }

  render() {
    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderTitel />
          <Col md={{ span: 6, offset: 3 }}>
            <Card>
              <Card.Body>
                <Card.Title>Current Positions</Card.Title>
                {this.renderScoreTable(this.props.teams)}
              </Card.Body>
            </Card>
            {Object.values(this.props.rounds).map((round, index) => (
              <Card key={index}>
                <Card.Body>
                  <Card.Title>
                    Round {index + 1}: {round.category}
                  </Card.Title>
                  <Card.Title>Questions: {round.questionsCount}</Card.Title>
                  <div>
                    <b>Round Scores</b>
                    {this.renderScoreTable(round.teamTotals)}
                  </div>
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
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    rounds: state.createScoreboard.rounds,
    teams: state.createScoreboard.teams
  };
}

export const ScorebordOverzichtScore = ReactRedux.connect(mapStateToProps)(ScorebordOverzichtScoreUI);
