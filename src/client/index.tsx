import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import allReducers from './action-reducers/store';
import { applyMiddleware } from 'redux';

import { BrowserRouter as Router } from 'react-router-dom';

const getFromLocalStorage = () => {
  const state = localStorage.getItem('state');

  if (!state) {
    return {};
  }

  const item = JSON.parse(state);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem('state');
    return {};
  }

  return item.value;
};

const saveToLocalStorage = value => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + 86400
  };

  localStorage.setItem('state', JSON.stringify(item));
};

// Sync all of redux to local storage so when you refresh the game state
// is exactly the same, session id is saved in a cookie and sent to the
// server when the socket is reopened.
// Save it for 1 day just incase any of the other stuff breaks. Not foolproof but
// should be ok.
const onChange = () => {
  saveToLocalStorage(theStore.getState());
};

export const theStore = Redux.createStore(allReducers, getFromLocalStorage(), applyMiddleware());

theStore.subscribe(onChange);

const mainComponent = (
  <ReactRedux.Provider store={theStore}>
    <Router>
      <App />
    </Router>
  </ReactRedux.Provider>
);

ReactDOM.render(mainComponent, document.getElementById('root'));
