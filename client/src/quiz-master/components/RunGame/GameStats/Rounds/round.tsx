import React, { useState } from 'react';
import { List, ListItem, ListItemText, Collapse, makeStyles, ListItemProps } from '@material-ui/core';
import { Link } from '@reach/router';

import { baseUrl } from '../../../../config';

interface Props {
  round: {
    id: string;
    name: string;
    questions: {
      id: string;
      text: string;
    }[];
  };
  number: number;
  gameId: string;
}

const useStyles = makeStyles(theme => ({
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));

const ListItemLink = (props: ListItemProps<'a', { to: string; button?: true }>) => <ListItem button component={Link} {...props} />;

const Round: React.FC<Props> = ({ round, number, gameId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const classes = useStyles();

  return (
    <>
      <ListItem onClick={() => setIsExpanded(v => !v)}>
        <ListItemText>
          {number}: {round.name}
        </ListItemText>
      </ListItem>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {round.questions.map((question, index) => (
            <ListItemLink to={`${baseUrl}/game/${gameId}/question/${question.id}`} className={classes.nested} key={question.id}>
              <ListItemText>
                {index + 1}: {question.text}
              </ListItemText>
            </ListItemLink>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default Round;
