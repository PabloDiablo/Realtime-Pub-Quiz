import React, { useContext, createContext, useReducer } from 'react';

import { State, Team, Game, ScoresList } from '../types/state';

export enum ActionTypes {
  SetIsLoggedIn,
  SetHasConnected,
  SetGames,
  SetTeams,
  SetScores
}

interface SetIsLoggedIn {
  type: ActionTypes.SetIsLoggedIn;
  isLoggedIn: boolean;
}

interface SetHasConnected {
  type: ActionTypes.SetHasConnected;
}

interface SetGamesAction {
  type: ActionTypes.SetGames;
  games: Game[];
}

interface SetTeamsAction {
  type: ActionTypes.SetTeams;
  teams: Team[];
}

interface SetScoresAction {
  type: ActionTypes.SetScores;
  scores: ScoresList[];
}

export type Action = SetIsLoggedIn | SetHasConnected | SetGamesAction | SetTeamsAction | SetScoresAction;

const defaultState: State = {
  isLoggedIn: false,
  hasConnected: false,
  games: [],
  teams: [],
  scores: []
};

export const StateContext = createContext({
  state: defaultState,
  dispatch: (action: Action) => console.log(`StateContext.Provider not found in tree to handle ${ActionTypes[action.type]}.`)
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.SetIsLoggedIn:
      return { ...state, isLoggedIn: action.isLoggedIn };
    case ActionTypes.SetHasConnected:
      return { ...state, hasConnected: true };
    case ActionTypes.SetGames:
      return { ...state, games: action.games };
    case ActionTypes.SetTeams:
      return { ...state, teams: action.teams };
    case ActionTypes.SetScores:
      return { ...state, scores: action.scores };
  }
};

export const StateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const value = {
    state,
    dispatch
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export const useStateContext = () => useContext(StateContext);
