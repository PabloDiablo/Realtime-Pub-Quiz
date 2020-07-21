import React, { useState } from 'react';
import { List, ListItem, ListItemText, ListItemProps, Collapse, makeStyles } from '@material-ui/core';
import { Link } from '@reach/router';

import { baseUrl } from '../../config';
import { Game } from '../../types/state';
import { GameStatus } from '../../../../shared/types/status';

interface Props {
  games: Game[];
  className: string;
}

const useStyles = makeStyles(theme => ({
  imageContainer: {
    margin: '10px'
  },
  image: {
    width: '100%'
  },
  button: {
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,.08) !important',
      color: 'white'
    }
  },
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));

const Menu: React.FC<Props> = ({ games, className }) => {
  const [isGameListOpen, setIsGameListOpen] = useState(false);
  const [isArchivedGameListOpen, setIsArchivedGameListOpen] = useState(false);

  const classes = useStyles();

  const ListItemLink = (props: ListItemProps<'a', { to: string; button?: true }>) => (
    <ListItem button component={Link} classes={{ button: classes.button }} {...props} />
  );

  const gamesInProgress = games.filter(g => g.status !== GameStatus.EndGame);
  const endedGames = games.filter(g => g.status === GameStatus.EndGame);

  return (
    <div className={className}>
      <div className={classes.imageContainer}>
        <Link to={baseUrl}>
          <img src="/images/logo-small.png" alt="QuizWhip Logo" className={classes.image} />
        </Link>
      </div>
      <List component="nav">
        <ListItem button className={classes.button} onClick={() => setIsGameListOpen(val => !val)}>
          <ListItemText primary="Games" />
        </ListItem>

        <Collapse in={isGameListOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {gamesInProgress.map(game => (
              <ListItemLink to={`${baseUrl}/game/${game.id}`} className={classes.nested} key={game.id}>
                <ListItemText primary={game.name} />
              </ListItemLink>
            ))}
          </List>
        </Collapse>

        <ListItemLink to={`${baseUrl}/create-game`}>
          <ListItemText primary="Create Game" />
        </ListItemLink>

        <ListItemLink to={`${baseUrl}/list-questions`}>
          <ListItemText primary="Questions" />
        </ListItemLink>

        <ListItem button className={classes.button} onClick={() => setIsArchivedGameListOpen(val => !val)}>
          <ListItemText primary="Archived Games" />
        </ListItem>

        <Collapse in={isArchivedGameListOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {endedGames.map(game => (
              <ListItemLink to={`${baseUrl}/game/${game.id}`} className={classes.nested} key={game.id}>
                <ListItemText primary={game.name} />
              </ListItemLink>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );
};

export default Menu;
