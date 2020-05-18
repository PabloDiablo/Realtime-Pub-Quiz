import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { acceptTeam, deleteTeam } from '../../websocket';

interface Props {
  team: {
    teamName: string;
    playerCode: string;
    teamId: string;
  };
  gameRoom: string;
  removeLatePlayerFromQueue(teamName: string): void;
}

const LatePlayer: React.FC<Props> = ({ team: { teamName, playerCode, teamId }, gameRoom, removeLatePlayerFromQueue }) => {
  const [isLoading, setIsLoading] = useState(false);

  const acceptPlayer = async () => {
    setIsLoading(true);
    await acceptTeam(gameRoom, teamId);
    setIsLoading(false);
    removeLatePlayerFromQueue(teamName);
  };

  const rejectPlayer = async () => {
    setIsLoading(true);
    await deleteTeam(gameRoom, teamId);
    setIsLoading(false);
    removeLatePlayerFromQueue(teamName);
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
