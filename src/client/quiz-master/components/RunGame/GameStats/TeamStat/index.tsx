import React, { useState } from 'react';
import { TableRow, TableCell, makeStyles, Collapse, Button } from '@material-ui/core';

import { Team } from '../../../../types/state';

interface Props {
  team: Team;
}

const useStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  },
  teamStatusOk: {
    color: 'green'
  },
  teamStatusNotOk: {
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

  const getTeamStatus = (accepted: boolean) => (
    <span className={accepted ? classes.teamStatusOk : classes.teamStatusNotOk}>{accepted ? 'Accepted' : 'Pending'}</span>
  );

  const handleBlockPlayer = () => {
    setIsSaving(true);

    console.log('setTeamStatus', {
      gameRoom: team.gameId,
      teamId: team.teamId,
      status: 'blocked'
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
          <div>{getTeamStatus(team.accepted)}</div>
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
