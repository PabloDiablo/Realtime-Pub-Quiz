import React from 'react';
import ReactDOM from 'react-dom';

import '../shared/styles/index.css';
import '../shared/styles/App.css';

import Scoreboard from './components';

ReactDOM.render(
  <div className="scoreboard">
    <Scoreboard />
  </div>,
  document.getElementById('root')
);
