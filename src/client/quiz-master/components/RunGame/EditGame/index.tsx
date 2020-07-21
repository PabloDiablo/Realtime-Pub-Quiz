import React, { useState, useEffect } from 'react';
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
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';

import { FastAnswerOptions } from '../../../types/state';
import { getGameInfo, postGameSettings, postResetGame } from '../../../services/game';
import InlineMessage from '../../InlineMessage';
import { baseUrl } from '../../../config';

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
  },
  resetCard: {
    marginTop: theme.spacing(2)
  },
  resetContent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  },
  resetButton: {
    backgroundColor: 'red',
    '&:hover': {
      backgroundColor: 'darkred'
    }
  }
}));

interface Props extends RouteComponentProps {
  game?: string;
}

const EditGame: React.FC<Props> = ({ game, navigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isShowingWarning, setIsShowingWarning] = useState(false);

  const [correctPoints, setCorrectPoints] = useState<number | ''>('');
  const [randomPrizePosition, setRandomPrizePosition] = useState<number | ''>('');
  const [fastOption, setFastOption] = useState(FastAnswerOptions.None);
  const [fastBonusPoints, setFastBonusPoints] = useState<number | ''>('');
  const [fastBonusNumTeams, setFastBonusNumTeams] = useState<number | ''>('');

  const handleFastOptionChange = (e: React.ChangeEvent<{ value: FastAnswerOptions }>) => {
    setFastOption(e.target.value);

    switch (e.target.value) {
      case FastAnswerOptions.None:
        setFastBonusPoints('');
        setFastBonusNumTeams('');
        break;
      case FastAnswerOptions.FastSingle:
        setFastBonusNumTeams('');
        break;
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    const res = await postGameSettings({
      gameRoom: game,
      correctPoints: correctPoints || 0,
      randomPrizePosition: randomPrizePosition || 0,
      fastAnswerMethod: fastOption,
      bonusPoints: fastBonusPoints || 0,
      bonusNumTeams: fastBonusNumTeams || 0
    });

    if (res.success) {
      navigate(`${baseUrl}/game/${game}`);
      return;
    } else {
      setError('Could not save game settings. Please try again.');
    }

    setIsSaving(false);
  };

  const resetGame = async () => {
    setIsSaving(true);

    const res = await postResetGame({
      gameId: game
    });

    if (res.success) {
      navigate(`${baseUrl}/game/${game}`);
      return;
    } else {
      setError('Could not reset game. Please try again.');
    }

    setIsSaving(false);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      const res = await getGameInfo(game);

      if (res.success) {
        setCorrectPoints(res.correctPoints);
        setRandomPrizePosition(res.randomPrizePosition);
        setFastOption(res.fastAnswerMethod as FastAnswerOptions);
        setFastBonusPoints(res.bonusPoints);
        setFastBonusNumTeams(res.bonusNumTeams);
      } else {
        setError('Could not load game settings. Please try again.');
      }

      setIsLoading(false);
    };

    if (game) {
      load();
    }
  }, [game]);

  const classes = useStyles();

  return (
    <>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5" className={classes.headingText}>
            Edit game settings
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={Boolean(isSaving || isLoading || error)}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </CardContent>
      </Card>
      {isLoading && <InlineMessage isLoading text="Loading game info..." />}
      {!isLoading && error && <InlineMessage text={error} />}
      {!isLoading && !error && (
        <Container maxWidth="sm">
          <Card className={classes.formCard}>
            <CardContent>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
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
                  disabled={isSaving}
                  value={correctPoints}
                  onChange={e => setCorrectPoints(Number(e.target.value) || '')}
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
                  disabled={isSaving}
                  value={randomPrizePosition}
                  onChange={e => setRandomPrizePosition(Number(e.target.value) || '')}
                />
                <FormControl className={classes.formControl}>
                  <InputLabel id="fast-answer-bonus-label">Fast Answer Bonus</InputLabel>
                  <Select
                    labelId="fast-answer-bonus-label"
                    id="fast-answer-bonus-select"
                    value={fastOption}
                    onChange={handleFastOptionChange}
                    disabled={isSaving}
                  >
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
                    disabled={isSaving}
                    value={fastBonusPoints}
                    onChange={e => setFastBonusPoints(Number(e.target.value) || '')}
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
                    disabled={isSaving}
                    value={fastBonusPoints}
                    onChange={e => setFastBonusPoints(Number(e.target.value) || '')}
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
                    disabled={isSaving}
                    value={fastBonusNumTeams}
                    onChange={e => setFastBonusNumTeams(Number(e.target.value) || '')}
                  />
                </Collapse>
              </form>
            </CardContent>
          </Card>
          <Card className={classes.resetCard}>
            <CardContent className={classes.resetContent}>
              <Typography component="h1" variant="h5" className={classes.headingText}>
                Reset game
              </Typography>
              <Typography variant="body1">This cannot be undone!</Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className={classes.resetButton}
                disabled={Boolean(isSaving || isLoading || error)}
                onClick={() => setIsShowingWarning(true)}
              >
                Reset
              </Button>
            </CardContent>
          </Card>
          <Dialog open={isShowingWarning} onClose={() => setIsShowingWarning(false)}>
            <DialogTitle>Reset the game?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This will delete all players, including their answers and scores, and reset the game state. THIS CANNOT BE UNDONE.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={resetGame} color="primary" disabled={isLoading}>
                Reset
              </Button>
              <Button onClick={() => setIsShowingWarning(false)} color="primary" autoFocus disabled={isLoading}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </>
  );
};

export default EditGame;
