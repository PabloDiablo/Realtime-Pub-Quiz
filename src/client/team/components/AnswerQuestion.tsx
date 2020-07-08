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
  hasSaved: boolean;
  error: string;
}

class AnswerQuestion extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      teamAnswer: '',
      isSaving: false,
      hasSaved: false,
      error: ''
    };
  }

  onChangeCurrentAnswer = e => {
    this.setState({
      teamAnswer: e.target.value,
      hasSaved: false
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true, hasSaved: false, error: '' });

    const res = await postSubmitAnswer({
      questionId: this.props.question.questionId,
      answer: this.state.teamAnswer
    });

    if (res.success) {
      this.setState({ hasSaved: true });
    } else {
      this.setState({ error: 'Failed to send answer. Please try again. If this keeps happening please refresh your browser.' });
    }

    this.setState({ isSaving: false });
  };

  render() {
    const { isSaving } = this.state;
    const { question, image, category } = this.props.question;

    return (
      <Container>
        <Row className="min-vh-100">
          <HeaderLogo />
          <Col md={{ span: 10, offset: 1 }}>
            <Card>
              <Card.Body>
                <blockquote className="blockquote mb-0">
                  <p className="text-center">{question}</p>
                  {image && <img src={image} className="question-image" />}
                  <div className="blockquote-footer te">
                    Round: <b>{category}</b>
                  </div>
                </blockquote>
              </Card.Body>
            </Card>
            <Card bg="dark" border="danger" text="white">
              <Card.Body>
                {this.state.error && <div className="form-error-msg">{this.state.error}</div>}
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
                  <Button variant="success" type="submit" disabled={isSaving || this.state.hasSaved} block>
                    {isSaving && 'Sending...'}
                    {!isSaving && this.state.hasSaved && 'Saved!'}
                    {!isSaving && !this.state.hasSaved && 'Answer Question'}
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
