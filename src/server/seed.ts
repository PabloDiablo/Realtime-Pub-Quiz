import mongoose from 'mongoose';

import dbConfig from './config';
import AvailableQuestions from './database/model/availableQuestions';
import Games from './database/model/games';
import Questions from './database/model/questions';
import Rounds from './database/model/rounds';
import TeamAnswers from './database/model/teamAnswer';
import Teams from './database/model/teams';

const argv = process.argv;
const hasResetAllOption = argv.includes('--reset-all');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = require('./data.json');

async function run() {
  if (hasResetAllOption) {
    console.log('Resetting database...');
    await Promise.all([
      AvailableQuestions.deleteMany({}),
      Games.deleteMany({}),
      Questions.deleteMany({}),
      Rounds.deleteMany({}),
      TeamAnswers.deleteMany({}),
      Teams.deleteMany({})
    ]);
  } else {
    console.log('Resetting available questions...');
    await AvailableQuestions.deleteMany({});
  }

  console.log('Inserting new question data...');
  await AvailableQuestions.insertMany(data);
}

mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log(`Connected to database ${dbConfig.DB}`);

    return run();
  })
  .catch(console.error)
  .then(() => {
    mongoose.connection.close();
    console.log('Done');
  });
