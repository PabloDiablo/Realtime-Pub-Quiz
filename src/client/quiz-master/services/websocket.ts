import { httpHostname } from '../../config';

/*========================================
| delete Team from a Gameroom (for Quizmaster)
*/
export function deleteTeam(gameRoom, teamName) {
  if (teamName) {
    const url = `${httpHostname}/api/games/${gameRoom}/team/${teamName}`;

    const options: RequestInit = {
      method: 'DELETE',
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
| Accept a team in a Gameroom (for Quizmaster)
*/
export function acceptTeam(gameRoom, teamName) {
  if (teamName) {
    const url = `${httpHostname}/api/games/${gameRoom}/team/${teamName}`;

    const options: RequestInit = {
      method: 'PUT',
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
export function startRound(category?: string) {
  const url = `${httpHostname}/api/games/g/ronde`;

  const data = {
    roundCategories: [category]
  };

  const options: RequestInit = {
    method: 'POST',
    body: category ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };

  return fetch(url, options).catch(err => console.log(err));
}

/*========================================
| Starting a NEW question (for Quizmaster)
*/
export function startQuestion(question?) {
  const url = `${httpHostname}/api/game/g/ronde/0/question`;

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

  return fetch(url, options).catch(err => console.log(err));
}

/*========================================
| Get all answers from a question (for Quizmaster)
*/
// export function getQuestionAnswers() {
//   const store = theStore.getState();

//   let gameRoom = store.createGame.gameRoom;
//   const roundNumber = store.createGame.roundNumber;

//   const questionId = store.createGame.currentQuestionId;

//   if (gameRoom === null) {
//     gameRoom = store.createScoreboard.gameRoomScoreboard;
//   }

//   if (gameRoom && roundNumber && questionId) {
//     const url = `${httpHostname}/api/game/${gameRoom}/ronde/${roundNumber}/question/${questionId}/answers`;
//     const options: RequestInit = {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       credentials: 'include',
//       mode: 'cors'
//     };

//     return fetch(url, options)
//       .then(response =>
//         response.json().then(data => {
//           if (data.success) {
//             theStore.dispatch(addTeamQuestionAnswerAction(data.answers));
//           }
//         })
//       )
//       .catch(err => console.log(err));
//   }
// }

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
export function endGame() {
  const url = `${httpHostname}/api/games/g`;

  const data = {
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

  return fetch(url, options).catch(err => console.log(err));
}
