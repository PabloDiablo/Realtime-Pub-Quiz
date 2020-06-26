import React, { useState } from 'react';
import { List, ListItem, ListItemText, Collapse, makeStyles } from '@material-ui/core';

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
  selected: {
    background: 'blue'
  }
});

const Category: React.FC<Props> = ({ name, questions, selectedValues, onClickItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const classes = useStyles();

  const getItemClass = (id: string) => (selectedValues.includes(id) ? classes.selected : undefined);

  return (
    <>
      <ListItem button onClick={() => setIsExpanded(v => !v)}>
        <ListItemText className={classes.roundName}>{name}</ListItemText>
      </ListItem>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {questions.map(question => (
            <ListItem key={question.id} className={getItemClass(question.id)} onClick={() => onClickItem(question.id)}>
              <ListItemText>{question.text}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default Category;
