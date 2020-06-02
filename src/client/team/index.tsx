import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app';
import 'firebase/database';
import ReactNotification from 'react-notifications-component';

import '../shared/styles/index.css';
import '../shared/styles/App.css';

import { firebaseConfig } from '../config';
import { StateProvider } from './state/context';
import TeamApp from './components';

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <>
    <ReactNotification />
    <div className="team-app-wrapper">
      <StateProvider>
        <TeamApp />
      </StateProvider>
    </div>
  </>,
  document.getElementById('root')
);
