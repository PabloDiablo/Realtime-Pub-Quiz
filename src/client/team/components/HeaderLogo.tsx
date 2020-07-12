import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  image: {
    width: '50%',
    margin: '0 auto',
    display: 'block'
  }
}));

const HeaderLogo: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <img src="/images/logo.png" alt="Logo" className={classes.image} />
    </div>
  );
};

export default HeaderLogo;
