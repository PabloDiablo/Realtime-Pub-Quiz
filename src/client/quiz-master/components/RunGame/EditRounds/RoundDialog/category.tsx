import React, { useState } from 'react';
import { List, ListItem, ListItemText, Collapse, makeStyles, ListItemIcon } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

interface Props {
  name: string;
  questions: {
    id: string;
    text: string;
  }[];
  selectedValues: string[];
  onClickItem(id: string): void;
}

const useStyles = makeStyles({
  roundName: {
    '& > *': {
      fontWeight: 'bold'
    }
  },
  questionsList: {
    paddingLeft: '10px'
  },
  selected: {
    '& > * > *': {
      fontWeight: 'bold'
    }
  }
});

const Category: React.FC<Props> = ({ name, questions, selectedValues, onClickItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const classes = useStyles();

  const isSelected = (id: string) => selectedValues.includes(id);

  return (
    <>
      <ListItem button onClick={() => setIsExpanded(v => !v)}>
        <ListItemText className={classes.roundName}>{name}</ListItemText>
      </ListItem>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.questionsList}>
          {questions.map(question => (
            <ListItem key={question.id} selected={isSelected(question.id)} classes={{ selected: classes.selected }} onClick={() => onClickItem(question.id)}>
              <ListItemText>{question.text}</ListItemText>
              {isSelected(question.id) && (
                <ListItemIcon>
                  <CheckCircleOutlineIcon />
                </ListItemIcon>
              )}
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default Category;
