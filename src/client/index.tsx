import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import allReducers from './action-reducers/store';
import { applyMiddleware } from 'redux';

import { BrowserRouter as Router } from 'react-router-dom';

export const theStore = Redux.createStore(allReducers, applyMiddleware());

const mainComponent = (
  <ReactRedux.Provider store={theStore}>
    <Router>
      <App />
    </Router>
  </ReactRedux.Provider>
);

ReactDOM.render(mainComponent, document.getElementById('root'));
