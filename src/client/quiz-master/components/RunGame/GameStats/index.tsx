import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Card, Typography, CardContent, Grid, makeStyles, Table, TableContainer, Paper, TableBody, Button, Collapse } from '@material-ui/core';

import { GameStatus } from '../../../../../shared/types/status';
import { useStateContext } from '../../../state/context';
import { Game } from '../../../types/state';
import TeamStat from './TeamStat';
import CollapseCard from '../CollapseCard';
import Rounds from './Rounds';
import InlineMessage from '../../InlineMessage';
import { getRoundsAndQuestionsInGame, postNextAction, getGameInfo } from '../../../services/game';
import AnswersList from '../MarkAnswers/answers-list';
import Leaderboard from './Leaderboard';

const formatGameStatus = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.NotStarted:
      return 'Not started';
    case GameStatus.Lobby:
      return 'Waiting for players to join';
    case GameStatus.RoundIntro:
      return 'Waiting for you to start the round';
    case GameStatus.PreQuestion:
      return 'Waiting for you to read the question';
    case GameStatus.AskingQuestion:
      return 'Waiting for players to submit answers';
    case GameStatus.QuestionClosed:
      return 'Score players answers';
    case GameStatus.RoundEnded:
      return 'End of round';
    case GameStatus.EndGame:
      return 'Ended';
    default:
      return 'UNKNOWN STATE';
  }
};

const isQuestionStatus = (status: GameStatus): boolean => {
  switch (status) {
    case GameStatus.PreQuestion:
    case GameStatus.AskingQuestion:
    case GameStatus.QuestionClosed:
      return true;
    default:
      return false;
  }
};

const formatQuestionTitle = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.PreQuestion:
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
  headingCard: {
    display: 'flex',
    alignItems: 'center'
  },
  headingText: {
    flexGrow: 1
  },
  nextButton: {
    margin: theme.spacing(3, 0, 2)
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

interface RoundData {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
    answer: string | string[];
  }[];
}

interface Props extends RouteComponentProps {
  gameData: Game;
}

const GameStats: React.FC<Props> = ({ gameData: game }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswersExpanded, setIsAnswersExpanded] = useState(false);
  const [error, setError] = useState('');
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [randomPrizePosition, setRandomPrizePosition] = useState<number>(0);
  const [hasNextActionError, setHasNextActionError] = useState(false);

  const {
    state: { teams }
  } = useStateContext();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      const [roundsRes, infoRes] = await Promise.all([getRoundsAndQuestionsInGame(game.id), getGameInfo(game.id)]);

      if (roundsRes.success && infoRes.success) {
        setRounds(roundsRes.rounds);
        setRandomPrizePosition(infoRes.randomPrizePosition);
      } else {
        setError('Failed to get game data');
      }

      setIsLoading(false);
    };

    load();
  }, [game.id]);

  const handleNext = async () => {
    setIsSubmitting(true);
    setHasNextActionError(false);

    const res = await postNextAction(game.id);

    if (!res.success) {
      setHasNextActionError(true);
    }

    setIsSubmitting(false);
  };

  const toggleTeamAnswers = () => setIsAnswersExpanded(v => !v);

  const getAnswer = (roundId: string, questionId: string) => {
    if (!roundId || !questionId) {
      return '';
    }

    return rounds.find(r => r.id === roundId)?.questions?.find(q => q.id === questionId)?.answer;
  };

  const classes = useStyles();

  const teamsInGame = teams.filter(t => t.gameId === game.id);

  const isQuestion = isQuestionStatus(game.status);

  if (isLoading) {
    return <InlineMessage isLoading text="Loading game data" />;
  }

  if (error) {
    return <InlineMessage text={error} />;
  }

  const hasEnded = game.status === GameStatus.EndGame;

  const getMultipleChoices = () => {
    if (!game.question || game.question?.type !== 'multi') {
      return undefined;
    }

    const choices = ['A', 'B', 'C', 'D'];

    return game.question?.possibleOptions.map((opt, index) => `${choices[index]}: ${opt}`).join(', ');
  };

  return (
    <div>
      <Card>
        <CardContent className={classes.headingCard}>
          <div className={classes.headingText}>
            <Typography variant="h6">Game Stats</Typography>
            <Typography variant="body1">Current Status: {formatGameStatus(game.status)}</Typography>
            <Typography variant="body1">Teams: {teamsInGame.length}</Typography>
          </div>
          <div className={classes.nextButton}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || hasEnded} onClick={handleNext}>
              {isSubmitting ? '...' : 'Next'}
            </Button>
            {hasNextActionError && <Typography>Failed</Typography>}
          </div>
        </CardContent>
      </Card>
      <Card className={classes.questionCard}>
        <CardContent>
          <div className={classes.headingCard}>
            <div className={classes.headingText}>
              <Typography variant="h6">{formatQuestionTitle(game.status)}</Typography>
              <Typography variant="body1">
                {isQuestion ? game.question?.question : '-'} {isQuestion && game.question?.type === 'multi' ? getMultipleChoices() : undefined}
              </Typography>
              <Typography variant="body1">Answer: {isQuestion ? getAnswer(game.round?.id, game.question?.questionId) : '-'}</Typography>
            </div>
            <div className={classes.nextButton}>
              <Button type="submit" variant="contained" color="primary" onClick={toggleTeamAnswers} disabled={!isQuestion}>
                {isAnswersExpanded ? 'Hide Team Answers' : 'Show Team Answers'}
              </Button>
            </div>
          </div>
          <Collapse in={isAnswersExpanded} unmountOnExit>
            <AnswersList gameId={game.id} questionId={game.question?.questionId} teams={teams} />
          </Collapse>
        </CardContent>
      </Card>
      <Grid container spacing={2} className={classes.gridRoot}>
        <Grid item className={classes.gridItem}>
          <CollapseCard title="Rounds and Questions">
            <Rounds gameId={game.id} rounds={rounds} />
          </CollapseCard>
        </Grid>
        <Grid item className={classes.gridItem}>
          <CollapseCard title="Leaderboard">
            <Leaderboard gameId={game.id} randomPrizePosition={randomPrizePosition} rounds={rounds} />
          </CollapseCard>
        </Grid>
        <Grid item className={classes.gridItem}>
          <CollapseCard title="Teams">
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {teamsInGame.map(team => (
                    <TeamStat key={team.teamId} team={team} />
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
