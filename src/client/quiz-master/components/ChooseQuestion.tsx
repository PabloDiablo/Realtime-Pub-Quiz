import React, { useState, useEffect } from 'react';
import { Col, Row, Button, Spinner } from 'react-bootstrap';

import { startQuestion } from '../services/websocket';

import HeaderLogo from '../../shared/components/HeaderLogo';
import MessageBox from '../../shared/components/MessageBox';
import { getQuestionsInRound } from '../services/quiz-master';

import './ChooseCategories/styles.css';

interface Question {
  _id: string;
  question: string;
  image: string;
  answer: string;
  category: string;
}

const ChooseQuestion: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  const [isLoading, setIsLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const getAllCategories = async () => {
      setIsLoading(true);

      const res = await getQuestionsInRound();

      if (res.success) {
        setAllQuestions(res.questions);
      }

      setIsLoading(false);
    };
    getAllCategories();
  }, []);

  return (
    <div className="container-fluid px-md-5">
      <Row className="row pb-5 text-white">
        <HeaderLogo subTitle="Choose a question" />
      </Row>
      <div className="rounded">
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <div className="nav flex-column bg-white shadow-sm font-italic rounded p-3 text-center">
              <h3 className="text-center">Quiz info</h3>
              <hr />
              <Button
                variant="danger"
                type="submit"
                disabled={!selectedQuestion}
                onClick={() => {
                  startQuestion(selectedQuestion);
                }}
              >
                Start question
              </Button>
            </div>
          </Col>

          <Col lg={8} className="mb-5">
            <div className="choose-categories__list-container">
              <div className="choose-categories__list-label">Questions</div>
              <div className="choose-categories__list">
                {isLoading && (
                  <MessageBox heading="Loading...">
                    <Spinner animation="border" />
                  </MessageBox>
                )}
                {!isLoading && allQuestions.length === 0 && <div>No questions found!</div>}
                {!isLoading &&
                  allQuestions.length > 0 &&
                  allQuestions.map(question => (
                    <div
                      key={question._id}
                      className={`choose-categories__list-item ${selectedQuestion === question ? 'choose-categories__list-item--selected' : ''}`}
                      onClick={() => {
                        setSelectedQuestion(question);
                      }}
                    >
                      {question.question}
                    </div>
                  ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ChooseQuestion;
