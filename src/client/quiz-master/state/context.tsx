import React, { useContext, createContext, useReducer } from 'react';

import { State, Team, Game } from '../types/state';

export enum ActionTypes {
  SetIsLoggedIn,
  SetHasConnected,
  SetGames,
  SetTeams
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

export type Action = SetIsLoggedIn | SetHasConnected | SetGamesAction | SetTeamsAction;

const defaultState: State = {
  isLoggedIn: false,
  hasConnected: false,
  games: [],
  teams: []
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
