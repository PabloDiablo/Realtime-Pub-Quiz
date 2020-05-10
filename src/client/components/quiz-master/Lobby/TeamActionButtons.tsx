import React, { useState } from 'react';

import { GameRoomTeam } from '../../../types/state';
import { acceptTeam, deleteTeam } from '../../../websocket';

interface Props {
  team: GameRoomTeam;
  gameRoom: string;
}

const TeamActionButtons: React.FC<Props> = ({ team, gameRoom }) => {
  const [isSaving, setIsSaving] = useState(false);

  if (isSaving) {
    return <div className="team-action-buttons__label">Saving...</div>;
  }

  if (team.approved) {
    return <div className="team-action-buttons__badge">Accepted</div>;
  }

  return (
    <div className="team-action-buttons__container">
      <button
        className="action-success"
        type="submit"
        onClick={async () => {
          setIsSaving(true);
          try {
            await acceptTeam(gameRoom, team._id);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        Accept
      </button>
      <button
        className="action-danger"
        type="submit"
        onClick={async () => {
          setIsSaving(true);
          try {
            await deleteTeam(gameRoom, team._id);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        Reject
      </button>
    </div>
  );
};

export default TeamActionButtons;
