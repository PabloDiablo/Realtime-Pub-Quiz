import React, { useRef, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  makeStyles,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@material-ui/core';

import { QuestionAnswers } from '../../../types/response';
import { TeamSubmittedAnswer } from '../../../../../shared/types/quizMaster';
import TeamAnswer from './team-answer';

interface Props extends RouteComponentProps {
  game?: string;
  question?: string;
}

const useStyles = makeStyles(theme => ({
  questionCard: {
    marginTop: theme.spacing(2)
  },
  headingCard: {
    display: 'flex',
    alignItems: 'center'
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

const mockData = {
  success: true as true,
  question: 'Who is this?',
  correctAnswer: 'Bob',
  answers: [
    {
      team: {
        _id: '1234',
        name: 'Bozo',
        approved: true,
        playerCode: '1QWE',
        gameRoom: 'LEGEND'
      },
      gegeven_antwoord: 'Bob',
      correct: null,
      timestamp: 12345678,
      question: 'Who is this?'
    }
  ]
};

const MarkAnswers: React.FC<Props> = ({ game, question }) => {
  const timerRef = useRef<number>();
  const [, setIsLoading] = useState(false);
  const [data, setData] = useState<QuestionAnswers>(mockData);

  const classes = useStyles();

  const hasLoaded = data && data.question;

  const setTeamAnswers = (answers: TeamSubmittedAnswer[]) => setData({ ...data, answers });

  const firstCorrectTeam = data?.answers
    .filter(a => a.timestamp !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp)
    .find(a => a.correct)?.team._id;

  return (
    <>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5">
            Mark answers for this question
          </Typography>
        </CardContent>
      </Card>
      {!hasLoaded && (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      )}
      {hasLoaded && (
        <div>
          <Card className={classes.questionCard}>
            <CardContent>
              <Typography variant="body1">{data?.question}</Typography>
              <Typography variant="body1">Answer: {data?.correctAnswer}</Typography>
            </CardContent>
          </Card>
          <TableContainer component={Paper} className={classes.questionCard}>
            <Table>
              {!data?.answers && (
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.waitingCell}>Waiting for answers...</TableCell>
                  </TableRow>
                </TableBody>
              )}
              {data?.answers?.length && (
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell>Answer</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {data?.answers &&
                  data.answers.map(answer => (
                    <TeamAnswer
                      key={answer.team._id}
                      answer={answer}
                      questionId={question}
                      gameId={game}
                      isFirstCorrectAnswer={firstCorrectTeam === answer.team._id}
                      setTeamAnswers={setTeamAnswers}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </>
  );
};

export default MarkAnswers;
