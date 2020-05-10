import React from 'react';
import * as ReactRedux from 'react-redux';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import { httpHostname } from '../../../config';
import { createGameQuestionCategoriesAction } from '../../../action-reducers/createGame-actionReducer';
import { startRound } from '../../../websocket';
import HeaderLogo from '../../shared/HeaderLogo';

import './styles.css';

interface State {
  selectedCategories: string[];
}

interface Props {
  questionCategories: string[];
  gameRoom: string;
  roundNumber: string;
  doChangeQuestionCategories(categories: string[]): void;
}

class ChooseCategories extends React.Component<Props, State> {
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
    const categories = this.state.selectedCategories;

    if (!categories.includes(categoryName)) {
      this.setState({
        selectedCategories: [categoryName]
      });
    }
  }

  render() {
    const isSelected = (categoryName: string) => this.state.selectedCategories.includes(categoryName);
    const hasSelectedCategory = this.state.selectedCategories.length === 1;

    return (
      <div className="container-fluid px-md-5">
        <Row className="row py-5 text-white">
          <HeaderLogo subTitle="Choose a question" />
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
                <Button
                  variant="danger"
                  type="submit"
                  disabled={!hasSelectedCategory}
                  onClick={() => {
                    startRound(this.props.gameRoom, this.state.selectedCategories);
                  }}
                >
                  Start round
                </Button>
              </div>
            </Col>

            <Col lg={8} className="mb-5">
              <div className="choose-categories__list-container">
                <div className="choose-categories__list-label">Round categories</div>
                <div className="choose-categories__list">
                  {this.props.questionCategories.map(categoryName => (
                    <div
                      key={categoryName}
                      className={`choose-categories__list-item ${isSelected(categoryName) ? 'choose-categories__list-item--selected' : ''}`}
                      onClick={() => {
                        this.selectCategory(categoryName);
                      }}
                    >
                      {categoryName}
                    </div>
                  ))}
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

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ChooseCategories);
