import React, { useRef, useState, useEffect, useCallback } from 'react';
import { makeStyles, CircularProgress, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

import { getAllAnswersForQuestion } from '../../../services/game';
import TeamAnswer from './team-answer';
import { Team } from '../../../types/state';
import { useStateContext } from '../../../state/context';
import { GameStatus } from '../../../../../shared/types/status';

interface Props {
  gameId: string;
  questionId: string;
  teams: Team[];
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

const AnswersList: React.FC<Props> = ({ gameId, questionId, teams }) => {
  const timerRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TeamAnswerData[]>([]);

  const {
    state: { games }
  } = useStateContext();

  const gameStatus = games.find(g => g.id === gameId).status;

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
    if (gameStatus === GameStatus.AskingQuestion) {
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
  }, [gameStatus, fetchAnswers]);

  const setTeamAnswer = (id: string, isCorrect?: boolean) => {
    setData(dataList => {
      const index = dataList.findIndex(d => d.id === id);

      const newList = [...dataList];
      newList.splice(index, 1, { ...dataList[index], isCorrect });

      return newList;
    });
  };

  const classes = useStyles();

  if (isLoading) {
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  const firstCorrectTeamId = data
    .filter(a => a.timestamp !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp)
    .find(a => a.isCorrect)?.teamId;

  if (!isLoading) {
    return (
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
                <TableCell align="left" style={{ width: '200px' }}>
                  Team
                </TableCell>
                <TableCell>Answer</TableCell>
                <TableCell align="right" style={{ width: '150px' }} />
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
                gameStatus={gameStatus}
                setTeamAnswer={setTeamAnswer}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
};

export default AnswersList;
