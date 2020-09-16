import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app';
import 'firebase/database';

import { firebaseConfig } from '../config';
import { StateProvider } from './state/context';
import QuizMaster from './components';

import './index.css';

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <div className="quiz-master-wrapper">
    <StateProvider>
      <QuizMaster />
    </StateProvider>
  </div>,
  document.getElementById('root')
);
