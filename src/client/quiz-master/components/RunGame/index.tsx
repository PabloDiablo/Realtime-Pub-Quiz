import React from 'react';
import { RouteComponentProps, Router, Link } from '@reach/router';
import { AppBar, Toolbar, Button, Typography, makeStyles } from '@material-ui/core';

import { useStateContext } from '../../state/context';
import GameStats from './GameStats';
import EditGame from './EditGame';
import MarkAnswers from './MarkAnswers';
import { baseUrl } from '../../config';

const useStyles = makeStyles({
  container: {
    padding: '10px'
  },
  homeLink: {
    flexGrow: 1
  },
  link: {
    color: 'white',
    textDecoration: 'none'
  }
});

interface Props extends RouteComponentProps {
  game?: string;
}

const RunGame: React.FC<Props> = ({ game: gameParam }) => {
  const {
    state: { games }
  } = useStateContext();

  const classes = useStyles();

  const game = games.find(g => g.id === gameParam);

  if (!game) {
    return <div className={classes.container}>404</div>;
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.homeLink}>
            <Link to={`${baseUrl}/game/${game.id}`} className={classes.link}>
              <Typography variant="h6">{game.name}</Typography>
            </Link>
          </div>
          <Link to={`${baseUrl}/game/${game.id}/edit`} className={classes.link}>
            <Button color="inherit">Edit</Button>
          </Link>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <Router>
          <GameStats path="/" gameData={game} />
          <EditGame path="edit" />
          <MarkAnswers path="question/:question" />
        </Router>
      </div>
    </div>
  );
};

export default RunGame;
