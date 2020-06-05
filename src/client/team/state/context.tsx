import React, { useContext, createContext, useReducer } from 'react';

import { GameState, Question } from '../../types/state';
import { GameStatus, TeamStatus } from '../../../shared/types/status';

export enum ActionTypes {
  SetHasConnected,
  SetGameStatus,
  SetTeamStatus,
  SetQuestion,
  SetTeamName
}

interface SetHasConnectedAction {
  type: ActionTypes.SetHasConnected;
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

interface SetTeamNameAction {
  type: ActionTypes.SetTeamName;
  teamName: string;
}

export type Action = SetHasConnectedAction | SetGameStatusAction | SetTeamStatusAction | SetQuestionAction | SetTeamNameAction;

const defaultState: GameState = {
  hasConnected: false,
  gameStatus: GameStatus.Lobby,
  teamStatus: TeamStatus.New
};

export const StateContext = createContext({
  state: defaultState,
  dispatch: (action: Action) => console.log(`StateContext.Provider not found in tree to handle ${ActionTypes[action.type]}.`)
});

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case ActionTypes.SetHasConnected:
      return { ...state, hasConnected: true };
    case ActionTypes.SetGameStatus:
      return { ...state, gameStatus: action.gameStatus };
    case ActionTypes.SetTeamStatus:
      return { ...state, teamStatus: action.teamStatus };
    case ActionTypes.SetQuestion:
      return { ...state, question: action.question };
    case ActionTypes.SetTeamName:
      return { ...state, teamName: action.teamName };
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
