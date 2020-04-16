import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Games from '../database/model/games';
import Questions from '../database/model/questions';
import Question from '../database/model/question';
import Team from '../database/model/teams';
import Round from '../database/model/rounds';
import TeamAnswer from '../database/model/teamAnswer';

mongoose.set('useCreateIndex', true);

const router = express.Router();

//Use the bodyParser middleware
router.use(bodyParser.json());

/*====================================
| JOIN GAME WITH SCOREBOARD
*/
router.get('/games/:gameRoom/scoreboard', async (req, res) => {
  const gameRoomName = req.params.gameRoom;

  //Get current game
  let currentGame = await Games.findOne({ _id: gameRoomName });

  //set session gameRoomName
  req.session.gameRoomName = gameRoomName;

  //set session quizMaster = true
  req.session.scoreBoard = true;

  //set session quizMaster = false
  req.session.quizMaster = false;

  //Check if game exits
  if (!currentGame) {
    res.json({
      success: false
    });
  }

  interface ILocalRound {
    questionsCount: number;
    category: string;
    questions: {
      question: string;
      answer: string;
      teams: {
        teamName: string;
        answer: string;
        isCorrect: boolean;
      }[];
    }[];
    teamTotals: Record<string, number>;
  }

  const rounds: Record<number, ILocalRound> = {};
  const teams = {};

  currentGame.rondes.forEach((round, index) => {
    rounds[index] = {
      questionsCount: round.vragen.length,
      category: round.categories[0],
      questions: round.vragen.map(q => ({
        question: q.vraag,
        answer: q.antwoord,
        teams: q.team_antwoorden.map(a => ({
          teamName: a.team_naam,
          answer: a.gegeven_antwoord,
          isCorrect: a.correct
        }))
      })),
      teamTotals: {}
    };
  });

  Object.values(rounds).forEach((round, index) => {
    const teamTotals = {};

    round.questions.forEach(q => {
      q.teams.forEach(t => {
        if (!teamTotals[t.teamName]) {
          teamTotals[t.teamName] = 0;
        }

        if (!teams[t.teamName]) {
          teams[t.teamName] = 0;
        }
      });
    });

    Object.keys(teamTotals).forEach(team => {
      teamTotals[team] = round.questions.reduce((prev, curr) => prev + curr.teams.filter(t => t.teamName === team && t.isCorrect).length, 0);

      teams[team] = teams[team] + teamTotals[team];
    });

    rounds[index].teamTotals = teamTotals;
  });

  res.json({
    success: true,
    gameRoomName: gameRoomName,
    currentTeams: currentGame.teams,
    rounds: rounds,
    teams: teams
  });
});

/*====================================
| GET ALL TEAMS FROM A GAMEROOM
*/
router.get('/games/:gameRoom/teams', async (req, res) => {
  const gameRoom = req.params.gameRoom;

  let currentGame = await Games.findOne({ _id: gameRoom });

  return res.json({
    success: true,
    teams: currentGame.teams
  });
});

/*====================================
| DELETING A TEAM
*/
router.delete('/games/:gameRoom/team/:teamName', async (req, res) => {
  const gameRoom = req.params.gameRoom;
  const teamName = req.params.teamName;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoom && req.session.quizMaster) {
    //get current game
    let currentGame = await Games.findOne({ _id: gameRoom });

    //find the team in the array
    currentGame.teams.forEach(function(arrayItem, key) {
      if (arrayItem['_id'] === teamName) {
        currentGame.teams.splice(key, 1);
      }
    });

    //save gameRoomName document to MongoDB
    currentGame.save(function(err, game) {
      if (err) return console.error(err);
      console.log(teamName + ' verwijderd uit gameRoom: ' + game._id);
    });

    return res.json({
      success: true
    });
  } else {
    if (!req.session.quizMaster) {
      console.log('Error: Team delete called from non quiz master');
    }

    if (req.session.gameRoomName !== gameRoom) {
      console.log(`Error: Team delete called for non matching game room. Session room: ${req.session.gameRoomName}  Game room: ${gameRoom}`);
    }

    return res.json({
      success: false
    });
  }
});

/*====================================
| ACCEPTING A TEAM
*/
router.put('/games/:gameRoom/team/:teamName', async (req, res) => {
  const gameRoom = req.params.gameRoom;
  const teamName = req.params.teamName;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoom && req.session.quizMaster) {
    //get current game
    let currentGame = await Games.findOne({ _id: gameRoom });

    //find the team in the array and update the team
    currentGame.teams.forEach(function(arrayItem, key) {
      if (arrayItem['_id'] === teamName) {
        currentGame.teams[key].approved = true;
      }
    });

    //save gameRoomName document to MongoDB
    currentGame.save(function(err, game) {
      if (err) return console.error(err);
      console.log(teamName + ' geaccepteerd in gameRoom: ' + game._id);
    });

    return res.json({
      success: true
    });
  } else {
    if (!req.session.quizMaster) {
      console.log('Error: Team accept called from non quiz master');
    }

    if (req.session.gameRoomName !== gameRoom) {
      console.log(`Error: Team accept called for non matching game room. Session room: ${req.session.gameRoomName}  Game room: ${gameRoom}`);
    }
  }
});

/*====================================
| CREATE A NEW GAMEROOM
*/
router.post('/game', async (req, res) => {
  //Game room name
  const gameRoomName = req.body.gameRoomName;

  //Check if gameRoomName is already in mongoDB
  const gameRoomExits = await Games.findOne({ _id: gameRoomName });

  //If gameRoomName isn't in mongoDB
  if (!gameRoomExits) {
    //create gameRoomName
    var newGame = new Games({
      _id: gameRoomName,
      game_status: 'lobby'
    });

    //save gameRoomName document to MongoDB
    newGame.save(function(err, game) {
      if (err) return console.error(err);
      console.log(game._id + ' saved to Games collection.');
    });

    //set session gameRoomName
    req.session.gameRoomName = gameRoomName;

    //set session quizMaster = true
    req.session.quizMaster = true;

    //set session quizMaster = false
    req.session.scoreBoard = false;

    //send result
    res.json({
      gameRoomNameAccepted: true,
      QuizMaster: true,
      gameRoomName: gameRoomName
    });
  } else {
    res.json({
      gameRoomNameAccepted: false
    });
  }
});

/*====================================
| CREATE A NEW TEAM
*/
router.post('/team', async (req, res) => {
  const gameRoomName = req.body.gameRoomName;
  const teamName = req.body.teamName;

  //Get current game
  let currentGame = await Games.findOne({ _id: gameRoomName });

  //Check if game exits && dat die nog niet begonnen is
  if (currentGame) {
    let gameAlreadyStarted = await currentGame.game_status;
    if (gameAlreadyStarted === 'lobby') {
      //check of teamName available is
      let isTeamNameAvailable = true;
      currentGame.teams.forEach(function(arrayItem) {
        if (arrayItem['_id'] === teamName) {
          isTeamNameAvailable = false;
        }
      });

      //Checks if team isn't already in current game
      if (isTeamNameAvailable) {
        currentGame.teams.push(
          new Team({
            _id: teamName,
            approved: false,
            round_score: 0,
            team_score: 0
          })
        );

        //Save to mongoDB
        currentGame.save(function(err) {
          if (err) return console.error(err);
          res.json({
            id: req.session.id,
            gameRoomAccepted: true,
            teamNameStatus: 'pending',
            gameRoomName: gameRoomName,
            teamName: teamName
          });
        });

        //set session gameRoomName
        req.session.gameRoomName = gameRoomName;

        //set session teamName
        req.session.teamName = teamName;

        //set session quizMaster = false
        req.session.quizMaster = false;

        //set session quizMaster = false
        req.session.scoreBoard = false;
      } else {
        res.json({
          gameRoomAccepted: true,
          teamNameStatus: 'error'
        });
      }
    } else {
      res.json({
        gameRoomAccepted: true,
        teamNameStatus: 'already-started'
      });
    }
  } else {
    res.json({
      gameRoomAccepted: false,
      teamNameStatus: false
    });
  }
});

/*====================================
| START A NEW GAME (FROM LOBBY TOO CHOOSE_CATEGORY) OR END A GAME
*/
router.put('/games/:gameRoom', async (req, res) => {
  const gameRoomName = req.params.gameRoom;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName && req.session.quizMaster) {
    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    //Check if game exits
    if (currentGame) {
      //Change current game status to choose_category
      if (req.body.gameStatus === 'choose_category') {
        currentGame.game_status = req.body.gameStatus;

        //Save to mongoDB
        currentGame.save(function(err) {
          if (err) return console.error(err);
          res.json({
            success: true,
            gameStatus: currentGame.game_status
          });
        });
      }
      //Change current game status to end_game
      if (req.body.gameStatus === 'end_game') {
        currentGame.game_status = req.body.gameStatus;

        //Save to mongoDB
        currentGame.save(function(err) {
          if (err) return console.error(err);
          res.json({
            success: true,
            gameStatus: currentGame.game_status
          });
        });
      }
    } else {
      res.json({
        success: false
      });
    }
  }
});

/*====================================
| CREATE A NEW ROUND
*/
router.post('/games/:gameRoom/ronde', async (req, res) => {
  const gameRoomName = req.params.gameRoom;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName && req.session.quizMaster) {
    const roundCategories = req.body.roundCategories;

    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    //Check if game exits
    if (currentGame) {
      if (roundCategories) {
        currentGame.rondes.push(
          new Round({
            categories: roundCategories,
            ronde_status: 'open',
            vragen: []
          })
        );

        //Change current game status to choose_question
        currentGame.game_status = 'choose_question';

        //Reset round score
        currentGame.teams.map(team => {
          team.round_score = 0;
        });

        //Save to mongoDB
        currentGame.save(function(err) {
          if (err) return console.error(err);
          res.json({
            success: true
          });
        });
      } else {
        //Change current game status to choose_category
        currentGame.game_status = 'choose_category';

        //Save to mongoDB
        currentGame.save(function(err) {
          if (err) return console.error(err);
          res.json({
            success: true,
            chooseCategories: true
          });
        });
      }
    } else {
      res.json({
        success: false
      });
    }
  }
});

/*====================================
| GET ALL QUESTION CATEGORIES
*/
router.get('/questions/categories', async (req, res) => {
  //Check of isset session gameRoomName & is quizMaster
  if (req.session.quizMaster) {
    let questions = await Questions.find({});

    //get a array with unique categories
    const categories = [];
    questions.forEach(function(arrayItem, key) {
      if (!categories.includes(arrayItem.category)) {
        categories.push(arrayItem.category);
      }
    });

    res.json({
      success: true,
      categories: categories
    });
  }
});

/*====================================
| GET ALL QUESTION FROM THE SELECTED CATEGORIES
*/
router.get('/game/:gameRoom/ronde/:rondeID/questions', async (req, res) => {
  const gameRoomName = req.params.gameRoom;
  const rondeID = Number(req.params.rondeID) - 1;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName && req.session.quizMaster) {
    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    //Get all questions
    let allQuestions = await Questions.find({
      category: { $in: currentGame.rondes[rondeID].categories }
    });

    // already asked questions
    const askedQuestions = [];

    currentGame.rondes.forEach(round => {
      round.vragen.forEach(v => askedQuestions.push(v.vraag));
    });

    // remove already asked questions
    const filteredQuestions = allQuestions.filter(q => !askedQuestions.includes(q.question));

    res.json({
      success: true,
      questions: filteredQuestions
    });
  }
});

/*====================================
| POST A NEW QUESTION
*/
router.post('/game/:gameRoom/ronde/:roundID/question', async (req, res) => {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.roundID) - 1;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName && req.session.quizMaster) {
    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    // Get all questions
    const allQuestions = await Questions.find({
      category: { $in: currentGame.rondes[roundID].categories }
    });

    const maxQuestions = allQuestions.length;

    const question = req.body.question;

    if (question) {
      currentGame.rondes[roundID].vragen.push(
        new Question({
          vraag: question.question,
          antwoord: question.answer,
          image: question.image,
          categorie_naam: question.category,
          team_antwoorden: []
        })
      );

      //Change current game status to choose_question
      currentGame.game_status = 'asking_question';

      //Change current round status
      currentGame.rondes[roundID].ronde_status = 'asking_question';

      //Save to mongoDB
      currentGame.save(function(err) {
        if (err) return console.error(err);
        res.json({
          success: true,
          round_ended: false,
          show_questions: false,
          question: question.question,
          image: question.image,
          category: question.category,
          answer: question.answer,
          max_questions: maxQuestions
        });
      });
    } else {
      //Change current game status to choose_question
      currentGame.game_status = 'choosing_question';

      //Change current round status
      currentGame.rondes[roundID].ronde_status = 'choosing_question';

      let currentRounds = currentGame.rondes[roundID].vragen.length;

      //Check if round ended
      let round_ended = currentRounds >= maxQuestions;

      //If round ended
      if (round_ended) {
        currentGame.game_status = 'round_ended';
      }

      //Save to mongoDB
      currentGame.save(function(err) {
        if (err) return console.error(err);
        res.json({
          success: true,
          round_ended: round_ended,
          show_questions: true,
          max_questions: maxQuestions
        });
      });
    }
  }
});

/*====================================
| POST A ANSWER AS TEAM ON A QUESTION
*/
router.post('/game/:gameRoom/ronde/:rondeID/question/:questionID/team/:teamName/answer', async (req, res) => {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;
  const questionID = Number(req.params.questionID) - 1;
  const teamName = req.params.teamName;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName) {
    const teamAnswer = req.body.teamAnswer;

    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    let isAlreadyAnswered = false;
    let teamKey = null;

    //Check if team has already answered
    currentGame.rondes[roundID].vragen[questionID].team_antwoorden.forEach(function(arrayItem, key) {
      if (arrayItem.team_naam.includes(teamName) && arrayItem.team_naam === teamName) {
        isAlreadyAnswered = true;
        teamKey = key;
      }
    });

    if (isAlreadyAnswered) {
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden[teamKey].gegeven_antwoord = teamAnswer;
    } else {
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden.push(
        new TeamAnswer({
          team_naam: teamName,
          gegeven_antwoord: teamAnswer,
          correct: null
        })
      );
    }

    //Save to mongoDB
    currentGame.save(function(err) {
      if (err) return console.error(err);
      res.json({
        success: true,
        teamName: teamName,
        teamAnswer: teamAnswer
      });
    });
  }
});

/*====================================
| GET ALL ANSWERS FROM A QUESTION
*/
router.get('/game/:gameRoom/ronde/:rondeID/question/:questionID/answers', async (req, res) => {
  const gameRoom = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;
  const questionID = Number(req.params.questionID) - 1;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoom && (req.session.quizMaster || req.session.scoreBoard)) {
    let currentGame = await Games.findOne({ _id: gameRoom });

    if ((currentGame.game_status === 'question_closed' && req.session.scoreBoard) || req.session.quizMaster) {
      return res.json({
        success: true,
        answers: currentGame.rondes[roundID].vragen[questionID].team_antwoorden
      });
    }
  }
});

/*====================================
| CHANGE THE STATUS OF THE GAME TO CURRENT QUESTION CLOSED (AS QUIZMASTER)
*/
router.put('/game/:gameRoom/ronde/:rondeID/question', async (req, res) => {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName && req.session.quizMaster) {
    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    //Change current round status
    currentGame.rondes[roundID].ronde_status = 'question_closed';

    currentGame.game_status = 'question_closed';

    //Save to mongoDB
    currentGame.save(function(err) {
      if (err) return console.error(err);
      res.json({
        success: true,
        gameStatus: 'question_closed'
      });
    });
  }
});

/*====================================
| CHANGE A TEAM ANSWER TO CORRECT OR INCORRECT (AS QUIZMASTER)
*/
router.put('/game/:gameRoom/ronde/:rondeID/question/:questionID/team/:teamName/answer', async (req, res) => {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;
  const questionID = Number(req.params.questionID) - 1;
  const teamName = req.params.teamName;

  //Check of isset session gameRoomName & is quizMaster
  if (req.session.gameRoomName === gameRoomName && req.session.quizMaster) {
    const isCorrect = req.body.isCorrect;

    //Get current game
    let currentGame = await Games.findOne({ _id: gameRoomName });

    let isAnswered = false;
    let teamKey = null;

    // const totalQuestions = currentGame.rondes[roundID].vragen.length;

    //Check if team has already answered
    currentGame.rondes[roundID].vragen[questionID].team_antwoorden.forEach(function(arrayItem, key) {
      if (arrayItem.team_naam.includes(teamName) && arrayItem.team_naam === teamName) {
        isAnswered = true;
        teamKey = key;
      }
    });

    if (isAnswered) {
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden[teamKey].correct = isCorrect;
    }

    //Save to mongoDB
    currentGame.save(function(err) {
      if (err) return console.error(err);
      res.json({
        success: true,
        answers: currentGame.rondes[roundID].vragen[questionID].team_antwoorden
      });
    });
  }
});

export default router;
