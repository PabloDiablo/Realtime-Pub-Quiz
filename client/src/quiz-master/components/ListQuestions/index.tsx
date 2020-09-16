import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Card, CardContent, Typography, List, Button, Collapse } from '@material-ui/core';
import Category from './category';
import AddQuestion from './add-question';
import { QuestionType } from '../../../../../types/enum';
import { getAvailableQuestions } from '../../services/questions';
import InlineMessage from '../InlineMessage';

const useStyles = makeStyles(theme => ({
  container: {
    padding: '10px'
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
  listContainer: {
    marginTop: theme.spacing(2)
  },
  addQuestionContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column'
  },
  addQuestionButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

interface AvailableQuestion {
  id: string;
  text: string;
  image?: string;
  answer: string;
  type: QuestionType;
  category: string;
  possibleOptions?: string[];
}

const ListQuestions: React.FC<RouteComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const res = await getAvailableQuestions();

    if (res.success) {
      setAvailableQuestions(res.questions);
    } else {
      setError('Failed to get questions');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleOnSaved = () => {
    setIsAddingQuestion(false);
    load();
  };

  const categories = [];
  availableQuestions.forEach(q => {
    const cat = categories.find(c => c.name === q.category);

    if (cat) {
      cat.questions.push(q);
    } else {
      categories.push({
        name: q.category,
        questions: [q]
      });
    }
  });

  const categoryNames = categories.map(c => c.name);

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Card>
        <CardContent className={classes.headingCard}>
          <Typography component="h1" variant="h5">
            Available Questions
          </Typography>
        </CardContent>
      </Card>
      {isLoading && <InlineMessage isLoading text="Loading questions..." />}
      {!isLoading && error && <InlineMessage text={error} />}
      {!isLoading && !error && (
        <>
          <Card className={classes.listContainer}>
            <List>
              {categories.map(category => (
                <Category key={category.name} category={category} allCategories={categoryNames} onSaved={handleOnSaved} />
              ))}
            </List>
          </Card>
          <Card className={classes.addQuestionContainer}>
            <div className={classes.addQuestionButtonContainer}>
              <Button variant="contained" color="primary" disabled={isAddingQuestion} onClick={() => setIsAddingQuestion(true)}>
                Add New Question
              </Button>
            </div>
            <Collapse in={isAddingQuestion} timeout="auto" unmountOnExit>
              <AddQuestion close={() => setIsAddingQuestion(false)} isEditing={false} categories={categoryNames} onSaved={handleOnSaved} />
            </Collapse>
          </Card>
        </>
      )}
    </div>
  );
};

export default ListQuestions;
