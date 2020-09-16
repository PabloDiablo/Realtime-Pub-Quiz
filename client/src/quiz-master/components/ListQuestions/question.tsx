import React, { useState } from 'react';
import { ListItem, ListItemText, IconButton, makeStyles, Collapse } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import AddQuestion from './add-question';
import { QuestionType } from '../../../../../types/enum';

interface Props {
  question: {
    id: string;
    text: string;
    image?: string;
    answer: string;
    type: QuestionType;
    category: string;
    possibleOptions?: string[];
  };
  allCategories: string[];
  onSaved(): void;
}

const useStyles = makeStyles(theme => ({
  editCell: {
    width: '25px'
  },
  editQuestionContainer: {
    padding: theme.spacing(2)
  }
}));

const Question: React.FC<Props> = ({ question, allCategories, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false);

  const classes = useStyles();

  return (
    <>
      <ListItem>
        <ListItemText>{question.text}</ListItemText>
        <IconButton size="small" onClick={() => setIsEditing(v => !v)}>
          <EditIcon />
        </IconButton>
      </ListItem>
      <Collapse in={isEditing} timeout="auto" unmountOnExit>
        <div className={classes.editQuestionContainer}>
          <AddQuestion close={() => setIsEditing(false)} isEditing={true} question={question} categories={allCategories} onSaved={onSaved} />
        </div>
      </Collapse>
    </>
  );
};

export default Question;
