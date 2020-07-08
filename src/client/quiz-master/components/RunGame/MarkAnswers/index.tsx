import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Card, CardContent, Typography } from '@material-ui/core';

import AnswersList from './answers-list';
import { useStateContext } from '../../../state/context';
import { getRoundsAndQuestionsInGame } from '../../../services/game';
import InlineMessage from '../../InlineMessage';

interface Props extends RouteComponentProps {
  game?: string;
  question?: string;
}

interface RoundData {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
    answer: string | string[];
  }[];
}

const useStyles = makeStyles(theme => ({
  questionCard: {
    marginTop: theme.spacing(2)
  },
  headingCard: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const MarkAnswers: React.FC<Props> = ({ game, question }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rounds, setRounds] = useState<RoundData[]>([]);

  const {
    state: { teams }
  } = useStateContext();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      const res = await getRoundsAndQuestionsInGame(game);

      if (res.success) {
        setRounds(res.rounds);
      } else {
        setError('Failed to get game data');
      }

      setIsLoading(false);
    };

    load();
  }, [game]);

  const getQuestionById = (id: string) => rounds.find(r => r.questions.find(q => q.id === id))?.questions?.find(q => q.id === id);

  const questionData = getQuestionById(question);

  const classes = useStyles();

  return (
    <>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5">
            Mark answers for this question
          </Typography>
        </CardContent>
      </Card>
      {isLoading && <InlineMessage isLoading text="Loading game data" />}
      {!isLoading && error && <InlineMessage isLoading={false} text="Failed to get game data" />}
      {!isLoading && !error && (
        <>
          <Card className={classes.questionCard}>
            <CardContent>
              <Typography variant="body1">{questionData?.text}</Typography>
              <Typography variant="body1">Answer: {questionData?.answer}</Typography>
            </CardContent>
          </Card>
          <AnswersList gameId={game} questionId={question} teams={teams} />
        </>
      )}
    </>
  );
};

export default MarkAnswers;
