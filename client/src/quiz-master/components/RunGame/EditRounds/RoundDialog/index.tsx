import React, { useState } from 'react';
import { Dialog, DialogTitle, List, Card, CardContent, Typography, Button, TextField, makeStyles } from '@material-ui/core';

import Category from './category';

interface RoundData {
  id?: string;
  name: string;
  questions: string[];
}

interface Props {
  data: RoundData;
  isOpen: boolean;
  questionsData: {
    id: string;
    text: string;
    category: string;
  }[];
  onClose(value: RoundData);
}

const useStyles = makeStyles({
  categoriesList: {
    maxHeight: '50vh',
    overflow: 'auto'
  }
});

const RoundDialog: React.FC<Props> = ({ data, isOpen, questionsData, onClose }) => {
  const [roundName, setRoundName] = useState(data.name);
  const [selectedValues, setSelectedValues] = useState<string[]>(data.questions);

  const categories = [];
  questionsData.forEach(q => {
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

  const handleClose = () => {
    onClose({ name: roundName, questions: selectedValues });
  };

  const handleClickItem = (id: string) => {
    setSelectedValues(v => {
      if (v.includes(id)) {
        return v.filter(val => val !== id);
      } else {
        return [...v, id];
      }
    });
  };

  const classes = useStyles();

  return (
    <Dialog onClose={handleClose} open={isOpen} maxWidth="sm" fullWidth>
      <DialogTitle>Edit round</DialogTitle>
      <Card>
        <CardContent>
          <Typography variant="h6">Edit round name</Typography>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="editroundname"
            label="Name"
            name="editroundname"
            autoComplete="off"
            value={roundName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoundName(e.target.value)}
          />
          <Typography variant="h6">Select questions</Typography>
          <List className={classes.categoriesList}>
            {categories.map(category => (
              <Category key={category.name} name={category.name} questions={category.questions} onClickItem={handleClickItem} selectedValues={selectedValues} />
            ))}
          </List>
          <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleClose}>
            Save
          </Button>
        </CardContent>
      </Card>
    </Dialog>
  );
};

export default RoundDialog;
