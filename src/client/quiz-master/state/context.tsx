import React, { useContext, createContext, useReducer } from 'react';

import { State, Team } from '../types/state';
import { GameStatus } from '../../../shared/types/status';

export enum ActionTypes {
  SetGameStatus,
  SetTeams,
  SetGameRoom,
  SetQuestionId
}

interface SetGameStatusAction {
  type: ActionTypes.SetGameStatus;
  gameStatus: GameStatus;
}

interface SetTeamsAction {
  type: ActionTypes.SetTeams;
  teams: Team[];
}

interface SetGameRoomAction {
  type: ActionTypes.SetGameRoom;
  gameRoom: string;
}

interface SetQuestionIdAction {
  type: ActionTypes.SetQuestionId;
  questionId: string;
}

export type Action = SetGameStatusAction | SetTeamsAction | SetGameRoomAction | SetQuestionIdAction;

const defaultState: State = {
  gameStatus: GameStatus.NotSet,
  gameRoom: undefined,
  questionId: undefined,
  teams: []
};

export const StateContext = createContext({
  state: defaultState,
  dispatch: (action: Action) => console.log(`StateContext.Provider not found in tree to handle ${ActionTypes[action.type]}.`)
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.SetGameStatus:
      return { ...state, gameStatus: action.gameStatus };
    case ActionTypes.SetTeams:
      return { ...state, teams: action.teams };
    case ActionTypes.SetGameRoom:
      return { ...state, gameRoom: action.gameRoom };
    case ActionTypes.SetQuestionId:
      return { ...state, questionId: action.questionId };
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
