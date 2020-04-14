import React from 'react';
import * as ReactRedux from 'react-redux';
import { httpHostname } from '../../config';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { Card } from 'react-bootstrap';
import { createGameQuestionCategoriesAction } from '../../action-reducers/createGame-actionReducer';
import { startRound } from '../../websocket';

interface State {
  selectedCategories: string[];
}

interface Props {
  questionCategories: string[];
  gameRoom: string;
  roundNumber: string;
  doChangeQuestionCategories(categories: string[]): void;
}

class CategorieenUI extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategories: []
    };
  }

  componentDidMount() {
    const url = `${httpHostname}/api/questions/categories`;

    const options: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        if (data.success === true) {
          this.props.doChangeQuestionCategories(data.categories);
        } else {
        }
      });
  }

  selectCategory(categoryName) {
    let categories = this.state.selectedCategories;

    if (!categories.includes(categoryName)) {
      this.setState({
        selectedCategories: [categoryName]
      });
    }
  }

  getCategories() {
    return this.props.questionCategories.map(categoryName => {
      let isSelected;
      if (this.state.selectedCategories.includes(categoryName)) {
        isSelected = 'isSelected';
      }
      return (
        <Col
          key={categoryName}
          md={6}
          xl={4}
          className={'pb-3'}
          onClick={() => {
            this.selectCategory(categoryName);
          }}
        >
          <Card className={isSelected}>
            <Card.Body>
              <Card.Title className="text-center m-0">{categoryName}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      );
    });
  }

  render() {
    let startRoundButton;
    if (this.state.selectedCategories.length === 1) {
      startRoundButton = (
        <Button
          variant="danger"
          type="submit"
          onClick={() => {
            startRound(this.props.gameRoom, this.state.selectedCategories);
          }}
        >
          Start round
        </Button>
      );
    }
    return (
      <div className="container-fluid px-md-5">
        <Row className="row py-5 text-white">
          <Col lg={9} className={'mx-auto text-center'}>
            <h1 className="display-3">Quarantine Quiz</h1>
            <p className="lead mb-0">Choose a category</p>
          </Col>
        </Row>
        <div className="rounded">
          <Row>
            <Col lg={4} className={'mb-4 mb-lg-0'}>
              <div className="nav flex-column bg-white shadow-sm font-italic rounded p-3 text-center">
                <h3 className={'text-center'}>Quiz info</h3>
                <hr />
                <p>
                  <b>Gameroom name</b>
                  <br />
                  {this.props.gameRoom}
                </p>
                <p>
                  <b>Current round</b>
                  <br />
                  {this.props.roundNumber}
                </p>
                {startRoundButton}
              </div>
            </Col>

            <Col lg={8} className={'mb-5'}>
              <div className="p-5 bg-white d-flex align-items-center shadow-sm rounded h-100">
                <div className="demo-content">
                  <p className="lead font-italic">
                    <b>- Round categories</b>
                  </p>
                  <Row>{this.getCategories()}</Row>
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
    gameRoom: state.createGame.gameRoom,
    questionCategories: state.createGame.questionCategories,
    roundNumber: state.createGame.roundNumber
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doChangeQuestionCategories: categories => dispatch(createGameQuestionCategoriesAction(categories))
  };
}

export const QuizzMasterCategorieen = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(CategorieenUI);