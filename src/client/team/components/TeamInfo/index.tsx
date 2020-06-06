import React, { useState } from 'react';

import { useStateContext } from '../../state/context';
import Button from '../../../shared/components/Button';

import './styles.css';
import { leaveGame } from '../../services/player';

const TeamInfo = () => {
  const [isShowingWarning, setIsShowingWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    state: { teamName }
  } = useStateContext();

  const leaveGameOnClick = async () => {
    setIsLoading(true);

    await leaveGame();

    window.location.href = '/';
  };

  return (
    <>
      {isShowingWarning && (
        <div className="team-info-warning">
          <div className="team-info-warning__shade" />
          <div className="team-info-warning__modal">
            <div className="team-info-warning__modal-message">Are you sure you want to leave the game?</div>
            <div className="team-info-warning__modal-buttons">
              <Button onClick={leaveGameOnClick} action="info" disabled={isLoading}>
                Leave Game
              </Button>
              <Button onClick={() => setIsShowingWarning(false)} action="info" disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="team-info-wrapper">
        <div className="team-info-wrapper__team-name">{teamName}</div>
        <div className="team-info-wrapper__leave-game">
          <Button onClick={() => setIsShowingWarning(true)} action="danger">
            Leave Game
          </Button>
        </div>
      </div>
    </>
  );
};

export default TeamInfo;
