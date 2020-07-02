import React, { useState } from 'react';
import { ListItem, ListItemText, Collapse, makeStyles, List } from '@material-ui/core';

import Question from './question';
import { QuestionType } from '../../../../shared/types/enum';

interface Props {
  category: {
    name: string;
    questions: {
      id: string;
      text: string;
      image?: string;
      answer: string | string[];
      type: QuestionType;
      category: string;
    }[];
  };
  allCategories: string[];
  onSaved(): void;
}

const useStyles = makeStyles({
  heading: {
    fontWeight: 'bold'
  }
});

const Category: React.FC<Props> = ({ category, allCategories, onSaved }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const classes = useStyles();

  return (
    <>
      <ListItem button onClick={() => setIsExpanded(v => !v)}>
        <ListItemText classes={{ primary: classes.heading }}>{category.name}</ListItemText>
      </ListItem>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {category.questions.map(question => (
            <Question key={question.id} question={question} allCategories={allCategories} onSaved={onSaved} />
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default Category;
