import React from "react";
import * as ReactRedux from "react-redux";
import { httpHostname } from "../../config";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import {
  createAddCurrentTeamsScoreboardAction,
  createScorebordStatusAction,
  getGameRoomTeamsScoreboardAction,
  setScores
} from "../../action-reducers/createScorebord-actionReducer";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import HeaderTitel from "../HeaderTitel";
import { openWebSocket } from "../../websocket";
import Menu from "../Menu";
import { createCurrentGameStatusAction } from "../../action-reducers/createGame-actionReducer";

class ScorebordJoinTeamUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameRoomName: ""
    };
  }

  handleSubmit = e => {
    e.preventDefault();

    const url = `${httpHostname}/api/games/${this.state.gameRoomName}/scoreboard`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      mode: "cors"
    };

    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          openWebSocket();
          this.props.doAddGameRoomName(data.gameRoomName);
          this.props.doAddCurrentTeamsScoreboard(data.currentTeams);
          this.props.doSetScores(data.rounds, data.teams);
          this.props.doChangeStatus("succes");
          this.props.doChangeGameStatus("show_scoreboard");
        } else {
          this.props.doChangeStatus("error");
        }
      });
  };

  errorMessage() {
    if (this.props.formValidationScoreboard === "error") {
      return "is-invalid";
    }
  }

  onChangeGameRoomName = e => {
    this.setState({
      gameRoomName: e.target.value
    });
  };

  render() {
    return (
      <Container>
        <div>
          <Menu />
        </div>
        <Row className="min-vh-100">
          <HeaderTitel subTitle="Scores" />
          <Col md={{ span: 8, offset: 2 }} className="h-100">
            <Form onSubmit={this.handleSubmit}>
              <Card bg="dark" border="danger" text="white">
                <Card.Header>View a game</Card.Header>
                <Card.Body>
                  <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>
                      Enter the game room name for the game you want to view
                    </Form.Label>
                    <Form.Control
                      type="text"
                      onChange={this.onChangeGameRoomName}
                      placeholder="Game room name"
                      className={this.errorMessage()}
                      autoComplete="off"
                    />
                    <div className="invalid-feedback">Game doesn't exist!</div>
                  </Form.Group>
                  <Button variant="danger" type="submit">
                    Go to scoreboard overview
                  </Button>
                  <Link to="/" className="btn btn-link">
                    Cancel
                  </Link>
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    formValidationScoreboard: state.createScoreboard.formValidationScoreboard,
    gameRoomScoreboard: state.createScoreboard.gameRoomScoreboard
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doChangeStatus: formValidationScoreboard =>
      dispatch(createScorebordStatusAction(formValidationScoreboard)),
    doAddCurrentTeamsScoreboard: currentTeamsScoreboard =>
      dispatch(createAddCurrentTeamsScoreboardAction(currentTeamsScoreboard)),
    doAddGameRoomName: gameRoomScoreboard =>
      dispatch(getGameRoomTeamsScoreboardAction(gameRoomScoreboard)),
    doChangeGameStatus: currentGameStatus =>
      dispatch(createCurrentGameStatusAction(currentGameStatus)),
    doSetScores: (rounds, teams) => dispatch(setScores(rounds, teams))
  };
}

export const ScorebordJoinTeam = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(ScorebordJoinTeamUI);
