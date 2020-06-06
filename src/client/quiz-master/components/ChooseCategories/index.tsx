import React, { useState, useEffect } from 'react';
import { Col, Row, Button, Spinner } from 'react-bootstrap';

import { startRound } from '../../services/websocket';
import HeaderLogo from '../../../shared/components/HeaderLogo';

import './styles.css';
import { getCategories } from '../../services/quiz-master';
import MessageBox from '../../../shared/components/MessageBox';

const ChooseCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    const getAllCategories = async () => {
      setIsLoading(true);

      const res = await getCategories();

      if (res.success) {
        setAllCategories(res.categories);
      }

      setIsLoading(false);
    };
    getAllCategories();
  }, []);

  return (
    <div className="container-fluid px-md-5">
      <Row className="row py-5 text-white">
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
                disabled={selectedCategory === ''}
                onClick={() => {
                  startRound(selectedCategory);
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
                {isLoading && (
                  <MessageBox heading="Loading...">
                    <Spinner animation="border" />
                  </MessageBox>
                )}
                {!isLoading && allCategories.length === 0 && <div>No categories found!</div>}
                {!isLoading &&
                  allCategories.length > 0 &&
                  allCategories.map(categoryName => (
                    <div
                      key={categoryName}
                      className={`choose-categories__list-item ${selectedCategory === categoryName ? 'choose-categories__list-item--selected' : ''}`}
                      onClick={() => {
                        setSelectedCategory(categoryName);
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
};

export default ChooseCategories;
