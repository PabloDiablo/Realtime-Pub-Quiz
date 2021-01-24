import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app';
import 'firebase/database';

import { firebaseConfig } from '../config';
import { StateProvider } from './state/context';
import { createAnalytics } from '../shared/helpers/analytics';
import TeamApp from './components';

import './index.css';

const app = firebase.initializeApp(firebaseConfig);
createAnalytics(app);

ReactDOM.render(
  <div className="team-app-wrapper">
    <StateProvider>
      <TeamApp />
    </StateProvider>
  </div>,
  document.getElementById('root')
);
