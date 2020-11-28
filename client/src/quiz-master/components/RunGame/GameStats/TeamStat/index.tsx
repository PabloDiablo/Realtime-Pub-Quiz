import React, { useState } from 'react';
import { TableRow, TableCell, makeStyles, Collapse, Button } from '@material-ui/core';

import { Team } from '../../../../types/state';
import { postTeamStatus } from '../../../../services/game';
import { TeamStatus } from '../../../../../../../types/status';

interface Props {
  team: Team;
}

const useStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  },
  teamStatusWaiting: {
    color: 'orange'
  },
  teamStatusJoined: {
    color: 'green'
  },
  teamStatusBlocked: {
    color: 'red'
  },
  actionButtonsCell: {
    paddingBottom: 0,
    paddingTop: 0,
    textAlign: 'right'
  }
});

const TeamStat: React.FC<Props> = ({ team }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const classes = useStyles();

  const getTeamStatus = (status: TeamStatus) => {
    switch (status) {
      case TeamStatus.Waiting:
        return <span className={classes.teamStatusWaiting}>Waiting</span>;
      case TeamStatus.Joined:
        return <span className={classes.teamStatusJoined}>Joined</span>;
      case TeamStatus.Blocked:
        return <span className={classes.teamStatusBlocked}>Blocked</span>;
      case TeamStatus.Quit:
        return <span className={classes.teamStatusWaiting}>Quit</span>;
    }
  };

  const handleBlockPlayer = () => {
    setIsSaving(true);

    postTeamStatus({
      gameRoom: team.gameId,
      teamId: team.teamId,
      status: TeamStatus.Blocked
    });

    setIsSaving(false);
  };

  return (
    <>
      <TableRow onClick={() => setIsExpanded(v => !v)} className={classes.root}>
        <TableCell>
          {team.teamName} [{team.playerCode}]
        </TableCell>
        <TableCell>
          <div>{getTeamStatus(team.status)}</div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.actionButtonsCell} colSpan={6}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Button title="Block this player code" onClick={handleBlockPlayer} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Block'}
            </Button>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default TeamStat;
