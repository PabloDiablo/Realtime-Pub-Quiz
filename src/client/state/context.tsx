import React, { useContext, useState, createContext, useEffect } from 'react';

import { GameState, TeamStatus } from '../types/state';
import { GameStatus } from '../../shared/types/status';
import { openSocketConnection } from './socket';

const defaultState: GameState = {
  gameStatus: GameStatus.Lobby,
  teamStatus: TeamStatus.New
};

export const StateContext = createContext(defaultState);

export const StateProvider: React.FC = ({ children }) => {
  const [gameState, setGameState] = useState(defaultState);

  useEffect(() => {
    openSocketConnection({
      setGameStatus: gameStatus => setGameState(state => ({ ...state, gameStatus })),
      setTeamStatus: teamStatus => setGameState(state => ({ ...state, teamStatus })),
      setQuestion: question => setGameState(state => ({ ...state, question }))
    });
  }, []);

  return <StateContext.Provider value={gameState}>{children}</StateContext.Provider>;
};

export const useStateContext = () => useContext(StateContext);
