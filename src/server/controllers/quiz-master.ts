import { Request, Response } from 'express';

import Games from '../database/model/games';
import Round from '../database/model/rounds';
import Questions from '../database/model/questions';
import Question from '../database/model/question';
import { createSession, getSessionById, closeGameroom, createGameRoom, getAllSocketHandlesByGameRoom } from '../session';
import { MessageType } from '../../shared/types/socket';

export async function createGame(req: Request, res: Response) {
  //Game room name
  const gameRoomName = req.body.gameRoomName;

  //Check if gameRoomName is already in mongoDB
  const gameRoomExists = await Games.findOne({ _id: gameRoomName });

  //If gameRoomName isn't in mongoDB
  if (!gameRoomExists) {
    //create gameRoomName
    const newGame = new Games({
      _id: gameRoomName,
      game_status: 'lobby'
    });

    //save gameRoomName document to MongoDB
    newGame.save((err, game) => {
      if (err) return console.error(err);
      console.log(`${game._id} saved to Games collection.`);
    });

    createGameRoom(gameRoomName);
    createSession(req.session.id, '', gameRoomName, true);

    //send result
    res.json({
      success: true,
      gameRoomNameAccepted: true,
      QuizMaster: true,
      gameRoomName: gameRoomName
    });
  } else {
    res.json({
      success: false,
      gameRoomNameAccepted: false
    });
  }
}

export async function getListOfPlayers(req: Request, res: Response) {
  const gameRoom = req.params.gameRoom;

  const currentGame = await Games.findOne({ _id: gameRoom });

  if (!currentGame) {
    res.json({
      success: false
    });
  } else {
    res.json({
      success: true,
      teams: currentGame.teams
    });
  }
}

export async function removeTeam(req: Request, res: Response) {
  const gameRoom = req.params.gameRoom;
  const teamName = req.params.teamName;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoom) {
    //get current game
    const currentGame = await Games.findOne({ _id: gameRoom });

    //find the team in the array
    currentGame.teams.forEach((arrayItem, key) => {
      if (arrayItem['_id'] === teamName) {
        currentGame.teams.splice(key, 1);
      }
    });

    //save gameRoomName document to MongoDB
    currentGame.save((err, game) => {
      if (err) return console.error(err);
      console.log(`${teamName} removed from gameRoom: ${game._id}`);
    });

    res.json({
      success: true
    });
  } else {
    if (session.gameRoom !== gameRoom) {
      console.log(`Error: Team delete called for non matching game room. Session room: ${session.gameRoom}  Game room: ${gameRoom}`);
    }

    res.json({
      success: false
    });
  }
}

export async function acceptTeam(req: Request, res: Response) {
  const gameRoom = req.params.gameRoom;
  const teamName = req.params.teamName;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoom) {
    //get current game
    const currentGame = await Games.findOne({ _id: gameRoom });

    //find the team in the array and update the team
    currentGame.teams.forEach((arrayItem, key) => {
      if (arrayItem['_id'] === teamName) {
        currentGame.teams[key].approved = true;
      }
    });

    //save gameRoomName document to MongoDB
    currentGame.save((err, game) => {
      if (err) return console.error(err);
      console.log(`${teamName} accepted in gameRoom: ${game._id}`);
    });

    res.json({
      success: true
    });
  } else {
    if (session.gameRoom !== gameRoom) {
      console.log(`Error: Team accept called for non matching game room. Session room: ${session.gameRoom}  Game room: ${gameRoom}`);
    }

    res.json({
      success: false
    });
  }
}

export async function startOrEndGame(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoomName) {
    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

    //Check if game exits
    if (currentGame) {
      //Change current game status to choose_category
      if (req.body.gameStatus === 'choose_category' || req.body.gameStatus === 'end_game') {
        currentGame.game_status = req.body.gameStatus;

        //Save to mongoDB
        currentGame.save(err => {
          if (err) return console.error(err);
          res.json({
            success: true,
            gameStatus: currentGame.game_status
          });

          if (req.body.gameStatus === 'end_game') {
            const sockets = getAllSocketHandlesByGameRoom(session.gameRoom);
            sockets.forEach(playerSocket => playerSocket && playerSocket.send(JSON.stringify({ messageType: MessageType.EndGame })));

            closeGameroom(gameRoomName);
          }
        });
      }
    } else {
      res.json({
        success: false
      });
    }
  } else {
    res.json({
      success: false
    });
  }
}

export async function createRound(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoomName) {
    const roundCategories = req.body.roundCategories;

    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

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
        currentGame.teams.forEach(team => {
          team.round_score = 0;
        });

        //Save to mongoDB
        currentGame.save(err => {
          if (err) return console.error(err);
          res.json({
            success: true
          });
        });
      } else {
        //Change current game status to choose_category
        currentGame.game_status = 'choose_category';

        //Save to mongoDB
        currentGame.save(err => {
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
  } else {
    res.json({
      success: false
    });
  }
}

export async function getAllCategories(req: Request, res: Response) {
  const questions = await Questions.find({});

  //get a array with unique categories
  const categories = [];
  questions.forEach(arrayItem => {
    if (!categories.includes(arrayItem.category)) {
      categories.push(arrayItem.category);
    }
  });

  res.json({
    success: true,
    categories: categories
  });
}

export async function getAllQuestionsInRound(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;
  const rondeID = Number(req.params.rondeID) - 1;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoomName) {
    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

    //Get all questions
    const allQuestions = await Questions.find({
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
  } else {
    res.json({
      success: false
    });
  }
}

export async function startQuestion(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.roundID) - 1;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoomName) {
    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

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
      currentGame.save(err => {
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

      const currentRounds = currentGame.rondes[roundID].vragen.length;

      //Check if round ended
      const round_ended = currentRounds >= maxQuestions;

      //If round ended
      if (round_ended) {
        currentGame.game_status = 'round_ended';
      }

      //Save to mongoDB
      currentGame.save(err => {
        if (err) return console.error(err);

        res.json({
          success: true,
          round_ended: round_ended,
          show_questions: true,
          max_questions: maxQuestions
        });
      });
    }
  } else {
    res.json({
      success: false
    });
  }
}

export async function getAllAnswersForQuestion(req: Request, res: Response) {
  const gameRoom = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;
  const questionID = Number(req.params.questionID) - 1;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoom) {
    const currentGame = await Games.findOne({ _id: gameRoom });

    res.json({
      success: true,
      answers: currentGame.rondes[roundID].vragen[questionID].team_antwoorden
    });
  } else {
    res.json({
      success: false
    });
  }
}

export async function closeQuestion(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName & is quizMaster
  if (session.gameRoom === gameRoomName) {
    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

    //Change current round status
    currentGame.rondes[roundID].ronde_status = 'question_closed';

    currentGame.game_status = 'question_closed';

    //Save to mongoDB
    currentGame.save(err => {
      if (err) return console.error(err);

      res.json({
        success: true,
        gameStatus: 'question_closed'
      });
    });
  } else {
    res.json({
      success: false
    });
  }
}

export async function setAnswerState(req: Request, res: Response) {
  const gameRoomName = req.params.gameRoom;
  const roundID = Number(req.params.rondeID) - 1;
  const questionID = Number(req.params.questionID) - 1;
  const teamName = req.params.teamName;

  const session = getSessionById(req.session.id);

  //Check of isset session gameRoomName
  if (session.gameRoom === gameRoomName) {
    const isCorrect = req.body.isCorrect;

    //Get current game
    const currentGame = await Games.findOne({ _id: gameRoomName });

    let isAnswered = false;
    let teamKey = null;

    // const totalQuestions = currentGame.rondes[roundID].vragen.length;

    //Check if team has already answered
    currentGame.rondes[roundID].vragen[questionID].team_antwoorden.forEach((arrayItem, key) => {
      if (arrayItem.team_naam.includes(teamName) && arrayItem.team_naam === teamName) {
        isAnswered = true;
        teamKey = key;
      }
    });

    if (isAnswered) {
      currentGame.rondes[roundID].vragen[questionID].team_antwoorden[teamKey].correct = isCorrect;
    }

    //Save to mongoDB
    currentGame.save(err => {
      if (err) return console.error(err);

      res.json({
        success: true,
        answers: currentGame.rondes[roundID].vragen[questionID].team_antwoorden
      });
    });
  } else {
    res.json({
      success: false
    });
  }
}
