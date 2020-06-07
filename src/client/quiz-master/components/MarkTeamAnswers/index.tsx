import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Col, Row, Button, Spinner } from 'react-bootstrap';

import { closeCurrentQuestion, startQuestion } from '../../services/websocket';
import MessageBox from '../../../shared/components/MessageBox';
import { TeamSubmittedAnswer } from '../../../../shared/types/quizMaster';
import HeaderLogo from '../../../shared/components/HeaderLogo';
import { GameStatus } from '../../../../shared/types/status';
import { QuestionAnswers } from '../../types/response';
import { useStateContext } from '../../state/context';
import { getQuestionAnswers } from '../../services/quiz-master';
import TeamAnswer from './TeamAnswer';

import './styles.css';

const MarkTeamAnswers: React.FC = () => {
  const {
    state: { gameStatus, questionId }
  } = useStateContext();

  const timerRef = useRef<number>();
  const [, setIsLoading] = useState(false);
  const [data, setData] = useState<QuestionAnswers>();

  const fetchAnswers = useCallback(async () => {
    setIsLoading(true);

    const res = await getQuestionAnswers(questionId);

    if (res.success) {
      setData(res);
    }

    setIsLoading(false);
  }, [questionId]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  useEffect(() => {
    if (gameStatus === GameStatus.AskingQuestion) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(fetchAnswers, 3000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      fetchAnswers();
    }
  }, [gameStatus, fetchAnswers]);

  const firstCorrectTeam = data?.answers
    .filter(a => a.timestamp !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp)
    .find(a => a.correct)?.team._id;

  const hasLoaded = data && data.question;

  const setTeamAnswers = (answers: TeamSubmittedAnswer[]) => setData({ ...data, answers });

  return (
    <div className="container-fluid px-md-5">
      <Row className="row py-5 text-white">
        <HeaderLogo subTitle="Manage the status of the current question." />
      </Row>

      <div className="rounded">
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <div className="nav flex-column bg-white shadow-sm font-italic rounded p-3 text-center">
              <h3 className="text-center m-0">Quiz info</h3>
              <hr />
              <Button
                variant="danger"
                type="submit"
                onClick={() => {
                  if (gameStatus === GameStatus.AskingQuestion) {
                    closeCurrentQuestion(questionId);
                  } else {
                    // this is actually close question
                    startQuestion();
                  }
                }}
              >
                {gameStatus === GameStatus.AskingQuestion ? 'End Question' : 'Next Question'}
              </Button>
            </div>
          </Col>

          <Col lg={8} className="mb-5">
            <div className="p-5 bg-white d-flex align-items-center shadow-sm rounded h-100">
              {!hasLoaded && (
                <MessageBox heading="Loading...">
                  <Spinner animation="border" />
                </MessageBox>
              )}
              {hasLoaded && (
                <div className="demo-content">
                  <h5>{data.question}</h5>
                  <p className="lead font-italic">
                    <b>- Correct answer:</b> {data.correctAnswer}
                  </p>
                  <div className="team-answer__container">
                    {!data.answers && <div>Waiting for answers...</div>}
                    {data.answers?.map(answer => (
                      <TeamAnswer
                        key={answer.team._id}
                        answer={answer}
                        isFirstCorrectAnswer={answer.team._id === firstCorrectTeam}
                        currentGameStatus={gameStatus}
                        questionId={answer.question}
                        setTeamAnswers={setTeamAnswers}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MarkTeamAnswers;
