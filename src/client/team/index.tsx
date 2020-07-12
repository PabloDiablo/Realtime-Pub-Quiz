import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app';
import 'firebase/database';

import { firebaseConfig } from '../config';
import { StateProvider } from './state/context';
import TeamApp from './components';

import './index.css';

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <div className="team-app-wrapper">
    <StateProvider>
      <TeamApp />
    </StateProvider>
  </div>,
  document.getElementById('root')
);
