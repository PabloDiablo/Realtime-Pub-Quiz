import React from 'react';
import * as ReactRedux from 'react-redux';
import { Col, Row, Button } from 'react-bootstrap';

import { GameRoomTeam, GameRoomTeamWithAnswer } from '../../../types/state';
import { closeCurrentQuestion, startQuestion } from '../../../websocket';
import HeaderLogo from '../../shared/HeaderLogo';
import TeamAnswer from './TeamAnswer';

import './styles.css';

interface TeamSubmittedAnswer {
  team?: {
    _id: string;
    name: string;
  };
  gegeven_antwoord: string;
  correct: boolean;
  timestamp: number;
}

interface Props {
  gameRoomTeams: GameRoomTeam[];
  allQuestionAnswers: TeamSubmittedAnswer[];
  currentGameStatus: string;
  gameRoom: string;
  roundNumber: string;
  currentQuestion: string;
  currentQuestionId: string;
  currentQuestionAnswer: string;
}

function mapAnswersToTeam(teams: GameRoomTeam[], answers: TeamSubmittedAnswer[]): GameRoomTeamWithAnswer[] {
  return teams.map(t => {
    const teamAnswer = answers.find(a => a.team?._id === t._id);

    return {
      _id: t._id,
      name: t.name,
      approved: t.approved,
      playerCode: t.playerCode,
      teamAnswer: teamAnswer?.gegeven_antwoord,
      timestamp: teamAnswer?.timestamp,
      isCorrect: teamAnswer?.correct
    };
  });
}

class MarkTeamAnswers extends React.Component<Props> {
  closeQuestion() {
    let currentButton;
    if (this.props.currentGameStatus === 'asking_question') {
      currentButton = (
        <Button
          variant="danger"
          type="submit"
          onClick={() => {
            closeCurrentQuestion(this.props.currentQuestionId);
          }}
        >
          End question
        </Button>
      );
    } else if (this.props.currentGameStatus === 'question_closed') {
      let allQuestionsReviewed = true;
      if (this.props.gameRoomTeams.length === this.props.allQuestionAnswers.length) {
        this.props.allQuestionAnswers.map(teamAnswer => {
          if (teamAnswer.correct === null) {
            allQuestionsReviewed = false;
          }
        });
      }

      if (allQuestionsReviewed === true) {
        currentButton = (
          <Button
            variant="danger"
            type="submit"
            onClick={() => {
              startQuestion(this.props.gameRoom, this.props.roundNumber, undefined);
            }}
          >
            Next question
          </Button>
        );
      }
    }

    return currentButton;
  }

  render() {
    const currentTeamAnswers = mapAnswersToTeam(this.props.gameRoomTeams, this.props.allQuestionAnswers);

    const firstCorrectTeam = currentTeamAnswers
      .filter(a => a.timestamp !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp)
      .find(a => a.isCorrect)?._id;

    return (
      <div className="container-fluid px-md-5">
        <Row className="row py-5 text-white">
          <HeaderLogo subTitle="Manage the status of the current question." />
        </Row>

        <div className="rounded">
          <Row>
            <Col lg={4} className={'mb-4 mb-lg-0'}>
              <div className="nav flex-column bg-white shadow-sm font-italic rounded p-3 text-center">
                <h3 className={'text-center m-0'}>Quiz info</h3>
                <hr />
                <p>
                  <b>Gameroom name:</b>
                  <br />
                  {this.props.gameRoom}
                </p>
                <p>
                  <b>Round:</b>
                  <br />
                  {this.props.roundNumber}
                </p>

                {this.closeQuestion()}
              </div>
            </Col>

            <Col lg={8} className={'mb-5'}>
              <div className="p-5 bg-white d-flex align-items-center shadow-sm rounded h-100">
                <div className="demo-content">
                  <h5>{this.props.currentQuestion}</h5>
                  <p className="lead font-italic">
                    <b>- Correct answer:</b> {this.props.currentQuestionAnswer}
                  </p>
                  <div className="team-answer__container">
                    {currentTeamAnswers.map(team => (
                      <TeamAnswer
                        key={team._id}
                        team={team}
                        isFirstCorrectAnswer={team._id === firstCorrectTeam}
                        currentGameStatus={this.props.currentGameStatus}
                        questionId={this.props.currentQuestionId}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    gameRoomTeams: state.createGame.gameRoomTeams,
    allQuestionAnswers: state.createGame.allQuestionAnswers,
    gameRoom: state.createGame.gameRoom,
    roundNumber: state.createGame.roundNumber,
    currentQuestion: state.createGame.currentQuestion,
    currentQuestionId: state.createGame.currentQuestionId,
    currentQuestionAnswer: state.createGame.currentQuestionAnswer,
    currentGameStatus: state.createGame.currentGameStatus
  };
}

export default ReactRedux.connect(mapStateToProps)(MarkTeamAnswers);
