import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  makeStyles,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent
} from '@material-ui/core';

import { getAllAnswersForQuestion, postAutomarkAnswers } from '../../../services/game';
import TeamAnswer from './team-answer';
import { Team } from '../../../types/state';
import { useStateContext } from '../../../state/context';
import { GameStatus } from '../../../../../../types/status';

interface Props {
  gameId: string;
  questionId: string;
  teams: Team[];
  isEditing?: boolean;
}

interface TeamAnswerData {
  id: string;
  gameId: string;
  questionId: string;
  teamId: string;
  timestamp: number;
  answer: string;
  isCorrect?: boolean;
}

const useStyles = makeStyles(theme => ({
  questionCard: {
    marginTop: theme.spacing(2)
  },
  autoMarkWrapper: {
    marginTop: theme.spacing(2),
    justifyContent: 'end',
    display: 'flex',
    flexDirection: 'row'
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
  loading: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  waitingCell: {
    fontStyle: 'italic'
  }
}));

const AnswersList: React.FC<Props> = ({ gameId, questionId, teams, isEditing }) => {
  const timerRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAutomarking, setIsAutomarking] = useState(false);
  const [data, setData] = useState<TeamAnswerData[]>([]);

  const {
    state: { games }
  } = useStateContext();

  const game = games.find(g => g.id === gameId);
  const currentQuestionId = game.question?.questionId;

  const fetchAnswers = useCallback(async () => {
    setIsLoading(true);

    const res = await getAllAnswersForQuestion(gameId, questionId);

    if (res.success) {
      setData(res.answers);
    }

    setIsLoading(false);
  }, [gameId, questionId]);

  useEffect(() => {
    if (gameId && questionId) {
      fetchAnswers();
    }
  }, [gameId, questionId, fetchAnswers]);

  useEffect(() => {
    if (game.status === GameStatus.AskingQuestion && currentQuestionId === questionId) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(fetchAnswers, 3000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      fetchAnswers();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game.status, currentQuestionId, questionId, fetchAnswers]);

  const setTeamAnswer = (id: string, isCorrect?: boolean) => {
    setData(dataList => {
      const index = dataList.findIndex(d => d.id === id);

      const newList = [...dataList];
      newList.splice(index, 1, { ...dataList[index], isCorrect });

      return newList;
    });
  };

  const automarkAnswers = async () => {
    setIsAutomarking(true);

    await postAutomarkAnswers({ gameId, questionId });
    await fetchAnswers();

    setIsAutomarking(false);
  };

  const classes = useStyles();

  const firstCorrectTeamId = data
    .filter(a => a.timestamp !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp)
    .find(a => a.isCorrect)?.teamId;

  const isMarking = game.status === GameStatus.QuestionClosed || isEditing;

  return (
    <>
      <Card className={classes.questionCard}>
        <CardContent className={classes.headingCard}>
          <div className={classes.headingText}>
            <Typography variant="h6">Question Stats</Typography>
            <Typography variant="body1">Answered: {data.length}</Typography>
            <Typography variant="body1">Correct: {data.filter(d => d.isCorrect).length}</Typography>
          </div>
          <div className={classes.nextButton}>
            {isMarking && (
              <Button disabled={isAutomarking} onClick={automarkAnswers} variant="contained" color="primary">
                Auto Mark
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <TableContainer component={Paper} className={classes.questionCard}>
        <Table>
          {data.length === 0 && (
            <TableBody>
              <TableRow>
                <TableCell className={classes.waitingCell}>Waiting for answers...</TableCell>
              </TableRow>
            </TableBody>
          )}
          {data.length > 0 && (
            <TableHead>
              <TableRow>
                <TableCell align="left" style={{ width: '200px', height: '55px' }}>
                  Team
                </TableCell>
                <TableCell>Answer</TableCell>
                <TableCell align="right" style={{ maxWidth: '150px' }}>
                  {isLoading && <CircularProgress />}
                </TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {data.map(answer => (
              <TeamAnswer
                key={answer.id}
                answer={answer}
                teamAnswerId={answer.id}
                isFirstCorrectAnswer={firstCorrectTeamId === answer.teamId}
                team={teams.find(t => t.teamId === answer.teamId)}
                isMarking={isMarking}
                isEditing={isEditing}
                setTeamAnswer={setTeamAnswer}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AnswersList;
