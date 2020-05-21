import React, { useContext, createContext, useEffect, useReducer } from 'react';

import { GameState, Question } from '../types/state';
import { GameStatus, TeamStatus } from '../../shared/types/status';
import { openSocketConnection } from './socket';

export enum ActionTypes {
  SetGameStatus,
  SetTeamStatus,
  SetQuestion
}

interface SetGameStatusAction {
  type: ActionTypes.SetGameStatus;
  gameStatus: GameStatus;
}

interface SetTeamStatusAction {
  type: ActionTypes.SetTeamStatus;
  teamStatus: TeamStatus;
}

interface SetQuestionAction {
  type: ActionTypes.SetQuestion;
  question: Question;
}

export type Action = SetGameStatusAction | SetTeamStatusAction | SetQuestionAction;

const defaultState: GameState = {
  gameStatus: GameStatus.Lobby,
  teamStatus: TeamStatus.New
};

export const StateContext = createContext({
  state: defaultState,
  dispatch: (action: Action) => console.log(`StateContext.Provider not found in tree to handle ${ActionTypes[action.type]}.`)
});

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case ActionTypes.SetGameStatus:
      return { ...state, gameStatus: action.gameStatus };
    case ActionTypes.SetTeamStatus:
      return { ...state, teamStatus: action.teamStatus };
    case ActionTypes.SetQuestion:
      return { ...state, question: action.question };
  }
};

export const StateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    openSocketConnection(dispatch);
  }, []);

  const value = {
    state,
    dispatch
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export const useStateContext = () => useContext(StateContext);
