import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { acceptTeam, deleteTeam } from '../services/websocket';
import { Team } from '../types/state';

interface Props {
  team: Team;
}

const LatePlayer: React.FC<Props> = ({ team: { teamName, playerCode, rdbid } }) => {
  const [isLoading, setIsLoading] = useState(false);

  const acceptPlayer = async () => {
    setIsLoading(true);
    await acceptTeam('g', rdbid);
    setIsLoading(false);
  };

  const rejectPlayer = async () => {
    setIsLoading(true);
    await deleteTeam('g', rdbid);
    setIsLoading(false);
  };

  return (
    <div className="late-player-banner">
      <div>
        Player <b>{teamName}</b> [{playerCode}] wants to join the game.
      </div>
      {isLoading && <div>Saving...</div>}
      {!isLoading && (
        <div>
          <Button variant="success" onClick={() => acceptPlayer()}>
            Accept
          </Button>
          <Button variant="danger" onClick={() => rejectPlayer()}>
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default LatePlayer;
