import React from 'react';
import { makeStyles } from '@material-ui/core';
import { ClimbingBoxLoader } from 'react-spinners';

import MessageBox from './MessageBox';

const useStyles = makeStyles(theme => ({
  loader: {
    '& > *': {
      margin: '0 auto',
      padding: theme.spacing(10)
    }
  }
}));

const TeamPending: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.loader}>
        <ClimbingBoxLoader sizeUnit="px" size={35} color="#FFF" loading={true} />
      </div>
      <MessageBox>Please wait for your player code and team name to be accepted.</MessageBox>
    </>
  );
};

export default TeamPending;
