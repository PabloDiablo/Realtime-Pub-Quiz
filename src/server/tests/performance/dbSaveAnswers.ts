import mongoose from 'mongoose';
import crypto from 'crypto';

import dbConfig from '../../config';
import teamNames from './static/team-names.json';

import Games from '../../database/model/games';
import TeamAnswer from '../../database/model/teamAnswer';
import Team from '../../database/model/teams';
import Round from '../../database/model/rounds';
import Question from '../../database/model/questions';
import AvailableQuestion from '../../database/model/availableQuestions';

import { GameStatus, RoundStatus, QuestionStatus } from '../../../shared/types/status';

const randomAnswers = ['harry', 'hagrid', 'ron', 'bob', 'phil', 'maggie'];

const getRandomAnswer = (): string => randomAnswers[Math.floor(Math.random() * randomAnswers.length)];

async function setupTeam(teamName: string, gameRoom: string) {
  const team = new Team({
    name: teamName,
    gameRoom: gameRoom,
    approved: true,
    playerCode: crypto.randomBytes(20).toString('hex')
  });

  return team.save();
}

async function setup() {
  const newGame = new Games({
    _id: getRandomAnswer(),
    game_status: GameStatus.Lobby
  });

  const savedGame = await newGame.save();

  const teams = await Promise.all(teamNames.map(t => setupTeam(t, savedGame._id)));

  const round = new Round({
    categories: ['Test'],
    gameRoom: savedGame._id,
    ronde_status: RoundStatus.AskingQuestion
  });

  const savedRound = await round.save();

  const questionToAsk = await AvailableQuestion.findOne({}).lean();

  const question = new Question({
    vraag: questionToAsk.question,
    image: questionToAsk.image,
    antwoord: questionToAsk.answer,
    categorie_naam: questionToAsk.category,
    status: QuestionStatus.Open,
    round: round._id,
    availableQuestion: questionToAsk._id
  });

  const savedQuestion = await question.save();

  return {
    gameRoom: savedGame._id,
    teamIds: teams.map(t => t._id),
    roundId: savedRound._id,
    questionId: savedQuestion._id
  };
}

async function getExistingGame(gameRoom: string) {
  const game = await Games.findById(gameRoom).lean();

  const teams = await Team.find({ gameRoom: game._id }).lean();

  const round = await Round.findOne({
    gameRoom,
    ronde_status: RoundStatus.AskingQuestion
  }).lean();

  const question = await Question.findOne({
    status: QuestionStatus.Open,
    round: round._id
  }).lean();

  return {
    gameRoom,
    teamIds: teams.map(t => t._id),
    roundId: round._id,
    questionId: question._id
  };
}

async function run() {
  const { gameRoom, teamIds, questionId } = await setup();
  // const { gameRoom, teamIds, questionId } = await getExistingGame('hagrid');

  async function writeToDb(gameRoom: string, teamId: string, submittedAnswer: string, questionId: string) {
    const now = new Date().getTime();

    // console.time(`Read time - ${teamId}`);
    // // get team
    // const team = await Team.findById(teamId).lean();
    // console.timeEnd(`Read time - ${teamId}`);

    // console.time(`Read round - ${teamId}`);
    // // get current round
    // const round = await Round.findOne({
    //   gameRoom,
    //   ronde_status: { $ne: RoundStatus.Ended }
    // }).lean();
    // console.timeEnd(`Read round - ${teamId}`);

    // console.time(`Read question - ${teamId}`);
    // // get open question in round
    // const currentQuestion = await Question.findOne({
    //   round: round._id,
    //   status: QuestionStatus.Open
    // }).lean();
    // console.timeEnd(`Read question - ${teamId}`);

    // console.time(`Read teamAnswer - ${teamId}`);
    // if team answer model exists for this teamId and questionId
    const teamAnswer = await TeamAnswer.findOne({
      question: new mongoose.Types.ObjectId(questionId) as any,
      team: new mongoose.Types.ObjectId(teamId) as any
    });
    // console.timeEnd(`Read teamAnswer - ${teamId}`);

    if (teamAnswer) {
      // if answer has changed
      if (teamAnswer.gegeven_antwoord !== submittedAnswer) {
        // update answer and timestamp
        teamAnswer.gegeven_antwoord = submittedAnswer;
        teamAnswer.timestamp = now;

        // console.time(`Update teamAnswer - ${teamId}`);
        await teamAnswer.save();
        // console.timeEnd(`Update teamAnswer - ${teamId}`);
      }
    } else {
      // create new team answer model
      const teamAnswerModel = new TeamAnswer({
        question: new mongoose.Types.ObjectId(questionId) as any,
        team: new mongoose.Types.ObjectId(teamId) as any,
        gegeven_antwoord: submittedAnswer,
        correct: null,
        timestamp: now
      });

      // console.time(`Insert teamAnswer - ${teamId}`);
      await teamAnswerModel.save();
      // console.timeEnd(`Insert teamAnswer - ${teamId}`);
    }
  }

  async function runTest(teamId: string) {
    const startTime = new Date().getTime();

    const teamAnswer = getRandomAnswer();

    console.log(`Writing ${teamAnswer} for ${teamId} to DB...`);

    let hasError = false;

    try {
      await writeToDb(gameRoom, teamId, teamAnswer, questionId);
    } catch (err) {
      console.error(err);

      hasError = true;
    }

    const stopTime = new Date().getTime();

    const timeMs = stopTime - startTime;

    if (!hasError) {
      console.log(`Written ${teamAnswer} for ${teamId} to DB in ${timeMs}ms`);
    } else {
      console.log(`[FATAL ERROR] Writing ${teamAnswer} for ${teamId} to DB after ${timeMs}ms`);
    }
  }

  console.log(`Running tests for ${teamIds.length} teams...`);

  // waterfall
  // return teamIds.reduce((p, x) => p.then(() => runTest(x)), Promise.resolve());

  const waitAndRunTest = (teamId: string, index: number) => new Promise(resolve => setTimeout(() => resolve(runTest(teamId)), index * 100));

  // concurrent
  // return Promise.all(teamIds.map(runTest));

  // concurrent with 50ms delay
  return Promise.all(teamIds.map(waitAndRunTest));

  // return Promise.all([runTest(teamIds[0]), runTest(teamIds[1]), runTest(teamIds[3])]);
  // return runTest(teamIds[0]);
}

console.log(`Connecting to database ${dbConfig.DB}...`);

mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
