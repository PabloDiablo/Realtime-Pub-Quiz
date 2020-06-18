import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  makeStyles,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
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
  gridRoot: {
    display: 'flex',
    marginTop: theme.spacing(2)
  },
  gridItem: {
    flexGrow: 1,
    minWidth: '410px'
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

const EditGame: React.FC<RouteComponentProps> = () => {
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
            Edit game settings
          </Typography>
          <Button type="submit" variant="contained" color="primary" className={classes.submit} disabled={isLoading}>
            Save
          </Button>
        </CardContent>
      </Card>
      <Grid container spacing={2} className={classes.gridRoot}>
        <Grid item className={classes.gridItem}>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="correctpoints"
              label="Points per Correct Answer"
              name="correctpoints"
              autoComplete="off"
              inputProps={{ className: classes.textField }}
              disabled={isLoading}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="randompos"
              label="Random Prize Position"
              name="randompos"
              autoComplete="off"
              inputProps={{ className: classes.textField }}
              disabled={isLoading}
            />
            <FormControl className={classes.formControl}>
              <InputLabel id="fast-answer-bonus-label">Fast Answer Bonus</InputLabel>
              <Select labelId="fast-answer-bonus-label" id="fast-answer-bonus-select" value={fastOption} onChange={handleFastOptionChange}>
                <MenuItem value={FastAnswerOptions.None}>None</MenuItem>
                <MenuItem value={FastAnswerOptions.FastSingle}>Single Fastest</MenuItem>
                <MenuItem value={FastAnswerOptions.FastX}>Fastest X</MenuItem>
                <MenuItem value={FastAnswerOptions.Sliding}>Sliding</MenuItem>
              </Select>
            </FormControl>
            <Collapse in={fastOption === FastAnswerOptions.FastSingle || fastOption === FastAnswerOptions.Sliding} timeout="auto" unmountOnExit>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="bonuspoints"
                label="Fastest Answer Bonus"
                name="bonuspoints"
                autoComplete="off"
                inputProps={{ className: classes.textField }}
                disabled={isLoading}
              />
            </Collapse>
            <Collapse in={fastOption === FastAnswerOptions.FastX} timeout="auto" unmountOnExit>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="bonuspoints"
                label="Fastest Answer Bonus"
                name="bonuspoints"
                autoComplete="off"
                inputProps={{ className: classes.textField }}
                disabled={isLoading}
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="bonuspointspct"
                label="Number of Teams"
                name="bonuspointspct"
                autoComplete="off"
                inputProps={{ className: classes.textField }}
                disabled={isLoading}
              />
            </Collapse>
          </form>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Card>
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
        </Grid>
      </Grid>
    </>
  );
};

export default EditGame;
