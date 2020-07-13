import React, { useState } from 'react';
import { Button, makeStyles, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';

import { useStateContext } from '../../state/context';

import { postLeaveGame } from '../../services/player';
import { TeamStatus } from '../../../../shared/types/status';

const useStyles = makeStyles({
  container: {
    width: '100%',
    minHeight: '50px',
    display: 'flex',
    padding: '0 10px',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  name: {
    fontWeight: 'bold'
  },
  leaveButton: {
    backgroundColor: '#dc3545',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#c82333'
    }
  }
});

const TeamInfo = () => {
  const [isShowingWarning, setIsShowingWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    state: { teamName, teamStatus }
  } = useStateContext();

  const leaveGameOnClick = async () => {
    setIsLoading(true);

    await postLeaveGame();

    window.location.href = '/';
  };

  const classes = useStyles();

  if (teamStatus !== TeamStatus.Joined) {
    return <div className={classes.container} />;
  }

  return (
    <>
      <div className={classes.container}>
        <div className={classes.name}>{teamName}</div>
        <div>
          <Button variant="contained" color="primary" type="submit" onClick={() => setIsShowingWarning(true)} className={classes.leaveButton}>
            Leave Game
          </Button>
        </div>
      </div>
      <Dialog open={isShowingWarning} onClose={() => setIsShowingWarning(false)}>
        <DialogTitle>Leave the game?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            If you want to rejoin the game, you will need to use the same player code but a new team name. If the same player code is used, your points will be
            added together.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={leaveGameOnClick} color="primary" disabled={isLoading}>
            Leave
          </Button>
          <Button onClick={() => setIsShowingWarning(false)} color="primary" autoFocus disabled={isLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamInfo;
