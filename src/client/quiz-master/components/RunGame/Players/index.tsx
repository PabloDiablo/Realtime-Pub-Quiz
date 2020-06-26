import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  makeStyles,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Container
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import { FastAnswerOptions } from '../../../types/state';

const useStyles = makeStyles(theme => ({
  headingCard: {
    display: 'flex',
    alignItems: 'center'
  },
  headingText: {
    flexGrow: 1
  },
  formCard: {
    marginTop: theme.spacing(2)
  },
  switchLabel: {
    marginLeft: '11px',
    marginRight: 0,
    width: '100%'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(-1)
  },
  textField: {
    backgroundColor: 'white'
  },
  formControl: {
    margin: theme.spacing(1),
    width: '100%'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const Players: React.FC<RouteComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fastOption, setFastOption] = useState(FastAnswerOptions.None);
  const [newPlayerCode, setNewPlayerCode] = useState('');
  const [playerCodes, setPlayerCodes] = useState<string[]>([]);

  const handleFastOptionChange = (e: React.ChangeEvent<{ value: FastAnswerOptions }>) => setFastOption(e.target.value);

  const handlePlayerCodeSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const newCodes = newPlayerCode
      .split(',')
      .map(nc => nc.trim())
      .filter(nc => !playerCodes.includes(nc));

    setPlayerCodes([...newCodes, ...playerCodes]);
    setNewPlayerCode('');
  };

  const removePlayerCode = (code: string): void => {
    setPlayerCodes(v => v.filter(c => c !== code));
  };

  const classes = useStyles();

  return (
    <>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5" className={classes.headingText}>
            Add and remove player codes
          </Typography>
          <Button type="submit" variant="contained" color="primary" className={classes.submit} disabled={isLoading}>
            Save
          </Button>
        </CardContent>
      </Card>
      <Container maxWidth="sm">
        <Card className={classes.formCard}>
          <CardContent>
            <Typography variant="h6">Player Codes</Typography>
            <Typography variant="body1">Add multiple codes with a comma separated list</Typography>
            <form noValidate onSubmit={handlePlayerCodeSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="playercode"
                label="Add Player Code"
                name="playercode"
                autoComplete="off"
                inputProps={{ className: classes.textField }}
                value={newPlayerCode}
                disabled={isLoading}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayerCode(e.target.value)}
              />
            </form>
          </CardContent>
          <List component="div">
            {playerCodes.map(code => (
              <ListItem key={code}>
                <ListItemText>{code}</ListItemText>
                <ListItemSecondaryAction onClick={() => removePlayerCode(code)}>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      </Container>
    </>
  );
};

export default Players;
