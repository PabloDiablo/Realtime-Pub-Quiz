import Cookies from 'js-cookie';
import io from 'socket.io-client';

import { theStore } from './index';
import { httpHostname } from './config';
import {
  createCurrentCategoryAction,
  createCurrentQuestionAction,
  createCurrentQuestionAnswerAction,
  getGameRoomTeamsAction,
  increaseGameRoundNumberAction,
  increaseQuestionNumberAction,
  addLatePlayerToQueue
} from './action-reducers/createGame-actionReducer';
import { createTeamNameStatusAction } from './action-reducers/createTeam-actionReducer';
import { createCurrentGameStatusAction, addTeamQuestionAnswerAction } from './action-reducers/createGame-actionReducer';
import {
  addTeamQuestionAnswersScoreboardAction,
  createAddCurrentTeamsScoreboardAction,
  createIsAnsweredScoreboardAction
} from './action-reducers/createScorebord-actionReducer';
import { MessageType } from '../shared/types/socket';

let theSocket: SocketIOClient.Socket;

export function hasSession() {
  return Boolean(Cookies.get('sid'));
}

export function clearSession() {
  Cookies.remove('sid');
  localStorage.clear();
}

export function setSessionId(id: string) {
  Cookies.set('sid', id, { expires: 1 });
}

function sendMessage(message: {}): void {
  if (!theSocket) {
    console.log('Could not send message. Socket not open.', message);
    return;
  }

  theSocket.send(JSON.stringify(message));
}

export function openWebSocket() {
  if (theSocket) {
    // not sure what this was for?
    return;
  }

  theSocket = io.connect();

  theSocket.on('message', data => {
    const message = JSON.parse(data);

    switch (message.messageType) {
      case MessageType.NewTeam:
        getTeams();
        console.log('NEW TEAM');
        break;

      case MessageType.TeamDeleted:
        getTeams();
        theStore.dispatch(createTeamNameStatusAction('deleted'));
        console.log('TEAM DELETED');
        break;

      case MessageType.TeamAccepted:
        theStore.dispatch(createTeamNameStatusAction('success'));
        console.log('TEAM ACCEPTED');
        break;

      case MessageType.ChooseCategories:
        theStore.dispatch(createCurrentGameStatusAction('choose_categories'));
        if (theStore.getState().createGame.roundNumber) {
          theStore.dispatch(increaseGameRoundNumberAction(theStore.getState().createGame.roundNumber + 1));
          theStore.dispatch(increaseQuestionNumberAction(0, undefined));
          console.log(theStore.getState().createGame.questionNumber);
        } else {
          theStore.dispatch(increaseGameRoundNumberAction(1));
        }
        console.log('CHOOSE CATEGORIES');
        break;

      case MessageType.ChooseQuestion:
        theStore.dispatch(createCurrentGameStatusAction('choose_question'));
        // Why?!
        getTeams();
        console.log('CHOOSE QUESTION');
        break;

      case MessageType.AskingQuestion:
        theStore.dispatch(createCurrentGameStatusAction('asking_question'));
        theStore.dispatch(createCurrentQuestionAction(message.question, message.image, message.questionId));
        theStore.dispatch(createCurrentCategoryAction(message.category));

        //Leeg alle eventuel gegeven antwoorden van vorige vragen
        theStore.dispatch(addTeamQuestionAnswerAction([]));
        theStore.dispatch(createIsAnsweredScoreboardAction(null));

        // Why?
        getTeams();

        if (theStore.getState().createGame.questionNumber) {
          theStore.dispatch(increaseQuestionNumberAction(theStore.getState().createGame.questionNumber + 1, message.maxQuestions));
        } else {
          theStore.dispatch(increaseQuestionNumberAction(1, message.maxQuestions));
        }

        console.log('ASKING QUESTION', message);
        break;

      case MessageType.GetQuestionAnswers:
        getQuestionAnswers();
        console.log('GET QUESTION ANSWERS');
        break;

      case MessageType.QuestionClosed:
        getQuestionAnswers();
        theStore.dispatch(createCurrentGameStatusAction('question_closed'));
        console.log('QUESTION CLOSED');
        break;

      case MessageType.EndRound:
        theStore.dispatch(createCurrentGameStatusAction('round_ended'));
        getTeams();
        console.log('END ROUND');
        break;

      case MessageType.EndGame:
        theStore.dispatch(createCurrentGameStatusAction('end_game'));
        theStore.dispatch(increaseGameRoundNumberAction(null));
        theStore.dispatch(increaseQuestionNumberAction(null, undefined));
        theStore.dispatch(getGameRoomTeamsAction([]));

        console.log('END GAME');
        break;

      case MessageType.QuizMasterLeftGame:
        theStore.dispatch(createCurrentGameStatusAction('quizmaster_left'));
        console.log('QUIZ MASTER LEFT GAME');
        break;

      case MessageType.NewTeamLate:
        theStore.dispatch(addLatePlayerToQueue(message.teamName, message.playerCode));
        break;

      default:
        console.log('Unknown messageType:', message);
    }
  });

  return theSocket;
}

/*========================================
| delete Team from a Gameroom (for Quizmaster)
*/
export function deleteTeam(gameRoom, teamName) {
  if (gameRoom && teamName) {
    const url = `${httpHostname}/api/games/${gameRoom}/team/${teamName}`;

    const options: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options)
      .then(response => {
        return response.json().then(() => {
          return getTeams();
        });
      })
      .catch(err => console.log(err));
  }
}

/*========================================
| Get all current teams from a Gameroom (For quizmaster)
*/
function getTeams() {
  const store = theStore.getState();

  let gameRoom; //if storeGameRoom is empty check store gameRoom from scoreboard

  if (store.createGame.gameRoom) {
    gameRoom = store.createGame.gameRoom;
  } else if (store.createScoreboard.gameRoomScoreboard) {
    gameRoom = store.createScoreboard.gameRoomScoreboard;
  }

  if (gameRoom) {
    const url = `${httpHostname}/api/games/${gameRoom}/teams`;

    const options: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options)
      .then(response => {
        if (response.status !== 200) {
          console.log('Er gaat iets fout' + response.status);
        }
        return response.json().then(data => {
          if (data.success) {
            if (store.createGame.gameRoom) {
              theStore.dispatch(getGameRoomTeamsAction(data.teams));
            } else if (store.createScoreboard.gameRoomScoreboard) {
              theStore.dispatch(createAddCurrentTeamsScoreboardAction(data.teams));
            }
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
}

/*========================================
| Accept a team in a Gameroom (for Quizmaster)
*/
export function acceptTeam(gameRoom, teamName) {
  if (gameRoom && teamName) {
    const url = `${httpHostname}/api/games/${gameRoom}/team/${teamName}`;

    const options: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options)
      .then(response => {
        return response.json().then(() => {
          return getTeams();
        });
      })
      .catch(err => console.log(err));
  }
}

/*========================================
| Starting a NEW game (for Quizmaster)
*/
export function startGame(gameRoom) {
  if (gameRoom) {
    const url = `${httpHostname}/api/games/${gameRoom}`;

    const data = {
      gameStatus: 'choose_category'
    };
    const options: RequestInit = {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options).catch(err => console.log(err));
  }
}

/*========================================
| Starting a NEW round (for Quizmaster)
*/
export function startRound(gameRoom, categories) {
  if (gameRoom) {
    const url = `${httpHostname}/api/games/${gameRoom}/ronde`;

    const data = {
      roundCategories: categories
    };

    const options: RequestInit = {
      method: 'POST',
      body: categories ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options).catch(err => console.log(err));
  }
}

/*========================================
| Starting a NEW question (for Quizmaster)
*/
export function startQuestion(gameRoom, rondeID, question) {
  if (gameRoom) {
    const url = `${httpHostname}/api/game/${gameRoom}/ronde/${rondeID}/question`;

    const data = {
      question
    };

    const options: RequestInit = {
      method: 'POST',
      body: question ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options)
      .then(res =>
        res.json().then(data => {
          if (data.success && !data.round_ended && !data.show_questions) {
            theStore.dispatch(createCurrentQuestionAnswerAction(data.answer));
          }
        })
      )
      .catch(err => console.log(err));
  }
}

/*========================================
| Get all answers from a question (for Quizmaster)
*/
export function getQuestionAnswers() {
  const store = theStore.getState();

  let gameRoom = store.createGame.gameRoom;
  const roundNumber = store.createGame.roundNumber;

  const questionId = store.createGame.currentQuestionId;

  if (gameRoom === null) {
    gameRoom = store.createScoreboard.gameRoomScoreboard;
  }

  if (gameRoom && roundNumber && questionId) {
    const url = `${httpHostname}/api/game/${gameRoom}/ronde/${roundNumber}/question/${questionId}/answers`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options)
      .then(response =>
        response.json().then(data => {
          if (data.success) {
            theStore.dispatch(addTeamQuestionAnswersScoreboardAction(data.answers));
            theStore.dispatch(addTeamQuestionAnswerAction(data.answers));
          }
        })
      )
      .catch(err => console.log(err));
  }
}

/*========================================
| Change a team answer to correct or incorrect (for Quizmaster)
*/
export function teamAnswerIsCorrect(teamId, questionId, isCorrect) {
  const url = `${httpHostname}/api/game/mark-answer`;

  const data = {
    teamId,
    questionId,
    isCorrect
  };

  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };

  return fetch(url, options)
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        theStore.dispatch(addTeamQuestionAnswerAction(data.answers));
      }
    })
    .catch(err => console.log(err));
}

/*========================================
| Change game status to QUESTION CLOSED
*/
export function closeCurrentQuestion(questionId: string) {
  const url = `${httpHostname}/api/game/close-question`;

  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify({ questionId }),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };

  fetch(url, options).catch(err => console.log(err));
}

/*========================================
| Starting a NEW game (for EndGame)
*/
export function endGame(gameRoom) {
  if (gameRoom) {
    const url = `${httpHostname}/api/games/${gameRoom}`;

    let data = {
      gameStatus: 'end_game'
    };
    const options: RequestInit = {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    return fetch(url, options)
      .then(response => {
        if (response.status !== 200) console.log('Er gaat iets fout' + response.status);
      })
      .catch(err => console.log(err));
  }
}
