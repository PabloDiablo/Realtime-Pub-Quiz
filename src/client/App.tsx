import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';

import QuizMaster from './components/quiz-master';
import Team from './team';

import './App.css';

class App extends React.Component {
  render() {
    return (
      <div>
        <ReactNotification />
        <Switch>
          <Route exact path="/">
            <Team />
          </Route>
          <Route path="/quiz-master">
            <QuizMaster />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;
