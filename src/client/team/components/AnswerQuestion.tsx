import React from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';

import HeaderLogo from '../../shared/components/HeaderLogo';
import { Question } from '../../types/state';
import { postSubmitAnswer } from '../services/player';

interface Props {
  question: Question;
}

interface State {
  teamAnswer: string;
  isSaving: boolean;
}

class AnswerQuestion extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      teamAnswer: '',
      isSaving: false
    };
  }

  onChangeCurrentAnswer = e => {
    this.setState({
      teamAnswer: e.target.value
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true });

    const res = await postSubmitAnswer({
      questionId: this.props.question.questionId,
      answer: this.state.teamAnswer
    });

    console.log(`answer submission: ${res.success}`);

    this.setState({ isSaving: false });
  };

  render() {
    const { isSaving } = this.state;
    const { question, image, category } = this.props.question;

    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderLogo subTitle="Answer the question" />
          <Col md={{ span: 10, offset: 1 }}>
            <Card>
              <Card.Body>
                <blockquote className="blockquote mb-0">
                  <p className="text-center">{question}</p>
                  {image && <img src={image} className="question-image" />}
                  <footer className="blockquote-footer te">
                    Category:
                    <cite title="Source Title">
                      {' '}
                      <b>{category}</b>
                    </cite>
                  </footer>
                </blockquote>
              </Card.Body>
            </Card>
          </Col>
          <Col md={{ span: 10, offset: 1 }}>
            <Card bg="dark" border="danger" text="white">
              <Card.Header>What's your answer?</Card.Header>
              <Card.Body>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group>
                    <Form.Label>You can change your answer if you need to...</Form.Label>
                    <Form.Control
                      maxLength={50}
                      type="text"
                      value={this.state.teamAnswer}
                      onChange={this.onChangeCurrentAnswer}
                      placeholder="Your answer"
                      autoComplete="off"
                      required
                    />
                  </Form.Group>
                  <Button variant="danger" type="submit" disabled={isSaving}>
                    {isSaving ? 'Sending...' : 'Answer Question'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default AnswerQuestion;
