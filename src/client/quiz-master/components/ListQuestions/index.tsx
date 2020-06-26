import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { makeStyles, Card, CardContent, Typography, List, Button, Collapse } from '@material-ui/core';
import Category from './category';
import AddQuestion from './add-question';
import { QuestionType } from '../../../../shared/types/enum';

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

const mockData = {
  questions: [
    {
      id: 'r1q1',
      text: 'What is this?',
      answer: 'Beer',
      type: QuestionType.FreeText,
      category: 'Mystery'
    },
    {
      id: 'r1q2',
      text: 'Who is this?',
      answer: 'Bob',
      type: QuestionType.FreeText,
      category: 'Mystery'
    },
    {
      id: 'r1q3',
      text: 'Who made this?',
      answer: 'Betty',
      type: QuestionType.FreeText,
      category: 'Mystery'
    },
    {
      id: 'r2q1',
      text: 'Who sang this?',
      answer: 'Sharon',
      type: QuestionType.FreeText,
      category: 'Music'
    },
    {
      id: 'r2q2',
      text: 'Who is this?',
      answer: 'Karen',
      type: QuestionType.FreeText,
      category: 'Music'
    },
    {
      id: 'r2q3',
      text: 'Who sang this?',
      answer: ['Billy', 'Freddie', 'Kelly', 'Lizzy'],
      type: QuestionType.MultipleChoice,
      category: 'Music'
    }
  ]
};

const ListQuestions: React.FC<RouteComponentProps> = () => {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const categories = [];
  mockData.questions.forEach(q => {
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
      <Card className={classes.listContainer}>
        <List>
          {categories.map(category => (
            <Category key={category.name} category={category} allCategories={categoryNames} />
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
          <AddQuestion close={() => setIsAddingQuestion(false)} isEditing={false} categories={categoryNames} />
        </Collapse>
      </Card>
    </div>
  );
};

export default ListQuestions;
