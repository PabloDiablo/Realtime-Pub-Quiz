import React, { useState } from 'react';

import { Team } from '../../types/state';
import { acceptTeam, deleteTeam } from '../../services/websocket';

interface Props {
  team: Team;
}

const TeamActionButtons: React.FC<Props> = ({ team }) => {
  const [isSaving, setIsSaving] = useState(false);

  if (isSaving) {
    return <div className="team-action-buttons__label">Saving...</div>;
  }

  if (team.accepted) {
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
            await acceptTeam('g', team.rdbid);
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
            await deleteTeam('g', team.rdbid);
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
