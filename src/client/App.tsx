import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';

import { QuizMasterApp } from './components/quiz-master/App';
import { TeamsApp } from './components/team-app/App';

import './App.css';

class App extends React.Component {
  render() {
    return (
      <div>
        <ReactNotification />
        <Switch>
          <Route exact path="/">
            <TeamsApp />
          </Route>
          <Route path="/new">
            <TeamsApp forceNewGame />
          </Route>
          <Route path="/quiz-master">
            <QuizMasterApp />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;
