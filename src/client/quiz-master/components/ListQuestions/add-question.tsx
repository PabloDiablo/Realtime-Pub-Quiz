import React, { useState } from 'react';
import { makeStyles, Button, TextField, FormControl, InputLabel, Select, MenuItem, Collapse, Grid, Typography } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

import { QuestionType } from '../../../../shared/types/enum';
import { postEditQuestion, postCreateQuestion } from '../../services/questions';

interface Props {
  isEditing: boolean;
  categories: string[];
  question?: {
    id: string;
    text: string;
    image?: string;
    answer: string;
    possibleOptions?: string[];
    type: QuestionType;
    category: string;
  };
  close(): void;
  onSaved(): void;
}

interface CategoryOptionType {
  inputValue?: string;
  title: string;
}

const filter = createFilterOptions<CategoryOptionType>();

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    width: '100%'
  },
  addQuestionFormContainer: {
    marginTop: theme.spacing(2)
  },
  addQuestionButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(1),
    '& > *': {
      margin: '0 10px',
      width: '90px'
    }
  },
  inputField: {
    marginTop: theme.spacing(1)
  },
  error: {
    color: 'red'
  }
}));

const AddQuestion: React.FC<Props> = ({
  close,
  onSaved,
  categories,
  isEditing = false,
  question = { text: '', answer: '', image: '', type: QuestionType.FreeText, possibleOptions: ['', '', '', ''] }
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionText, setQuestionText] = useState(question.text);
  const [questionImage, setQuestionImage] = useState(question.image);
  const [questionType, setQuestionType] = useState(question.type);
  const [questionAnswer, setQuestionAnswer] = useState<string>(question.answer);
  const [possibleOptions, setPossibleOptions] = useState<string[]>(question.possibleOptions ?? ['', '', '', '']);
  const [category, setCategory] = useState<CategoryOptionType | null>(question.category ? { title: question.category } : null);

  const classes = useStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    const submitFn = isEditing ? postEditQuestion : postCreateQuestion;

    const res = await submitFn({
      id: question.id,
      text: questionText,
      image: questionImage,
      answer: questionAnswer,
      type: questionType,
      category: category.title,
      possibleOptions
    });

    if (res.success) {
      onSaved();
    } else {
      setError('Failed to save question');
    }

    setIsLoading(false);
  };

  const handleTypeChange = (e: React.ChangeEvent<{ value: QuestionType }>) => {
    setQuestionType(e.target.value);
    setQuestionAnswer('');
    setPossibleOptions(['', '', '', '']);
  };

  const handleSetMultiAnswer = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = [...possibleOptions];
    value[index] = e.target.value;

    setPossibleOptions(value);
  };

  const categoriesOptions: CategoryOptionType[] = categories.map(c => ({ title: c }));

  return (
    <div className={classes.addQuestionFormContainer}>
      <form noValidate onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="text"
          label="Question Text"
          name="text"
          autoComplete="off"
          value={questionText}
          disabled={isLoading}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionText(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="text"
          label="Question Image URL"
          name="text"
          autoComplete="off"
          value={questionImage}
          disabled={isLoading}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionImage(e.target.value)}
        />
        <FormControl className={classes.formControl}>
          <InputLabel id="question-type-label">Question Type</InputLabel>
          <Select labelId="question-type-label" id="question-type-select" value={questionType} onChange={handleTypeChange}>
            <MenuItem value={QuestionType.FreeText}>Free Text</MenuItem>
            <MenuItem value={QuestionType.MultipleChoice}>Multiple Choice</MenuItem>
          </Select>
        </FormControl>
        <Collapse in={questionType === QuestionType.FreeText} timeout="auto" unmountOnExit>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="text"
            label="Answer"
            name="text"
            autoComplete="off"
            value={questionAnswer}
            disabled={isLoading}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionAnswer(e.target.value)}
          />
        </Collapse>
        <Collapse in={questionType === QuestionType.MultipleChoice} timeout="auto" unmountOnExit>
          <Grid container spacing={1}>
            <Grid container item xs={12} spacing={3}>
              <Grid item xs={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="text"
                  label="Answer A"
                  name="text"
                  autoComplete="off"
                  value={possibleOptions[0]}
                  disabled={isLoading}
                  onChange={handleSetMultiAnswer(0)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="text"
                  label="Answer B"
                  name="text"
                  autoComplete="off"
                  value={possibleOptions[1]}
                  disabled={isLoading}
                  onChange={handleSetMultiAnswer(1)}
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={3}>
              <Grid item xs={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="text"
                  label="Answer C"
                  name="text"
                  autoComplete="off"
                  value={possibleOptions[2]}
                  disabled={isLoading}
                  onChange={handleSetMultiAnswer(2)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="text"
                  label="Answer D"
                  name="text"
                  autoComplete="off"
                  value={possibleOptions[3]}
                  disabled={isLoading}
                  onChange={handleSetMultiAnswer(3)}
                />
              </Grid>
            </Grid>
          </Grid>
          <FormControl className={classes.formControl}>
            <InputLabel id="question-correct-label">Correct Answer</InputLabel>
            <Select
              labelId="question-correct-label"
              id="question-correct-select"
              required
              value={questionAnswer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionAnswer(e.target.value)}
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>
        </Collapse>
        <Autocomplete
          value={category}
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              setCategory({
                title: newValue
              });
            } else if (newValue && newValue.inputValue) {
              // Create a new value from the user input
              setCategory({
                title: newValue.inputValue
              });
            } else {
              setCategory(newValue);
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            // Suggest the creation of a new value
            if (params.inputValue !== '') {
              filtered.push({
                inputValue: params.inputValue,
                title: `Add "${params.inputValue}"`
              });
            }

            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="category-selection"
          options={categoriesOptions}
          getOptionLabel={option => {
            // Value selected with enter, right from the input
            if (typeof option === 'string') {
              return option;
            }
            // Add "xxx" option created dynamically
            if (option.inputValue) {
              return option.inputValue;
            }
            // Regular option
            return option.title;
          }}
          renderOption={option => option.title}
          freeSolo
          renderInput={params => <TextField {...params} className={classes.inputField} fullWidth label="Category" variant="outlined" />}
        />
      </form>
      {error && <Typography className={classes.error}>{error}</Typography>}
      <div className={classes.addQuestionButtonContainer}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
        <Button variant="contained" color="secondary" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddQuestion;
