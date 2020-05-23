import React, { useState } from 'react';

import Button from '../../shared/Button';

import './styles.css';
import { postEndGame } from '../../../services/quiz-master';

const ControlBar = () => {
  const [isShowingWarning, setIsShowingWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const endGameOnClick = async () => {
    setIsLoading(true);

    await postEndGame();

    window.location.href = '/';
  };

  return (
    <>
      {isShowingWarning && (
        <div className="team-info-warning">
          <div className="team-info-warning__shade" />
          <div className="team-info-warning__modal">
            <div className="team-info-warning__modal-message">Are you sure you want to end the game?</div>
            <div className="team-info-warning__modal-buttons">
              <Button onClick={endGameOnClick} action="info" disabled={isLoading}>
                End Game
              </Button>
              <Button onClick={() => setIsShowingWarning(false)} action="info" disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="team-info-wrapper">
        <div className="team-info-wrapper__team-name">Quiz Master</div>
        <div className="team-info-wrapper__leave-game">
          <Button onClick={() => setIsShowingWarning(true)} action="danger">
            End Game
          </Button>
        </div>
      </div>
    </>
  );
};

export default ControlBar;
