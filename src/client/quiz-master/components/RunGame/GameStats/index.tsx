import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Card, Typography, CardContent, Grid, makeStyles, Table, TableContainer, Paper, TableBody } from '@material-ui/core';

import { GameStatus } from '../../../../../shared/types/status';
import { useStateContext } from '../../../state/context';
import { Game } from '../../../types/state';
import TeamStat from './TeamStat';
import CollapseCard from '../CollapseCard';
import Rounds from './Rounds';

const formatGameStatus = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.NotSet:
      return 'Not started';
    case GameStatus.Lobby:
      return 'Waiting for players to join';
    case GameStatus.RoundEnded:
    case GameStatus.ChooseCategory:
      return 'Waiting for round to start';
    case GameStatus.ChooseQuestion:
      return 'Waiting for question';
    case GameStatus.AskingQuestion:
      return 'Asking question';
    case GameStatus.QuestionClosed:
      return 'Scoring answers';
    case GameStatus.EndGame:
      return 'Ended';
    default:
      return 'UNKNOWN STATE';
  }
};

const isQuestionStatus = (status: GameStatus): boolean => {
  switch (status) {
    case GameStatus.ChooseQuestion:
    case GameStatus.AskingQuestion:
    case GameStatus.QuestionClosed:
      return true;
    default:
      return false;
  }
};

const formatQuestionTitle = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.ChooseQuestion:
      return 'Next Question';
    case GameStatus.AskingQuestion:
    case GameStatus.QuestionClosed:
      return 'Current Question';
    default:
      return 'Not in round';
  }
};

const useStyles = makeStyles(theme => ({
  questionCard: {
    marginTop: theme.spacing(2)
  },
  gridRoot: {
    display: 'flex',
    marginTop: theme.spacing(2)
  },
  gridItem: {
    flexGrow: 1,
    minWidth: '410px'
  },
  teamStatusOk: {
    color: 'green'
  },
  teamStatusNotOk: {
    color: 'red'
  }
}));

interface Props extends RouteComponentProps {
  gameData: Game;
}

const GameStats: React.FC<Props> = ({ gameData: game }) => {
  const {
    state: { teams }
  } = useStateContext();

  const classes = useStyles();

  const teamsInGame = teams.filter(t => t.gameId === game.id);

  const isQuestion = isQuestionStatus(game.status);

  return (
    <div>
      <Card>
        <CardContent>
          <Typography variant="h6">Game Stats</Typography>
          <Typography variant="body1">Current Status: {formatGameStatus(game.status)}</Typography>
          <Typography variant="body1">Teams: {teamsInGame.length}</Typography>
        </CardContent>
      </Card>
      <Card className={classes.questionCard}>
        <CardContent>
          <Typography variant="h6">{formatQuestionTitle(game.status)}</Typography>
          <Typography variant="body1">{isQuestion ? game.question?.question : '-'}</Typography>
          <Typography variant="body1">Answer: {isQuestion ? '-' : '-'}</Typography>
        </CardContent>
      </Card>
      <Grid container spacing={2} className={classes.gridRoot}>
        <Grid item className={classes.gridItem}>
          <CollapseCard title="Rounds and Questions">
            <Rounds gameId={game.id} />
          </CollapseCard>
        </Grid>
        <Grid item className={classes.gridItem}>
          <CollapseCard title="Leaderboard" />
        </Grid>
        <Grid item className={classes.gridItem}>
          <CollapseCard title="Teams">
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {teamsInGame.map(team => (
                    <TeamStat key={team.rdbid} team={team} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CollapseCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default GameStats;
