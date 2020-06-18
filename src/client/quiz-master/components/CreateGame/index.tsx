import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Container, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Collapse } from '@material-ui/core';
import { FastAnswerOptions } from '../../types/state';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  switchLabel: {
    marginLeft: '11px',
    marginRight: 0,
    width: '100%'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
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

const CreateGame: React.FC<RouteComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fastOption, setFastOption] = useState(FastAnswerOptions.None);

  const handleFastOptionChange = (e: React.ChangeEvent<{ value: FastAnswerOptions }>) => setFastOption(e.target.value);

  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Create a new game
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="roomname"
            label="Game Room Name"
            name="roomname"
            autoComplete="off"
            autoFocus
            inputProps={{ className: classes.textField }}
            disabled={isLoading}
          />
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
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit} disabled={isLoading}>
            Save
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default CreateGame;
