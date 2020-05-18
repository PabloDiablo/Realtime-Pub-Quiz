//=====================================================================
//    State management for the createGame
//---------------------------------------------------------------------

// Action Creators:
export function createGameFormValidationAction(formValidation) {
  return {
    type: 'createGameFormValidationAction',
    formValidation: formValidation
  };
}

export function createGameRoomAction(gameRoom) {
  return {
    type: 'createGameRoomAction',
    gameRoom: gameRoom
  };
}

export function getGameRoomTeamsAction(gameRoomTeams) {
  return {
    type: 'getGameRoomTeamsAction',
    gameRoomTeams: gameRoomTeams
  };
}

export function createCurrentGameStatusAction(currentGameStatus) {
  return {
    type: 'createCurrentGameStatusAction',
    currentGameStatus: currentGameStatus
  };
}

export function createGameQuestionCategoriesAction(questionCategories) {
  return {
    type: 'createGameQuestionCategoriesAction',
    questionCategories: questionCategories
  };
}

export function createGameQuestionsAction(questions) {
  return {
    type: 'createGameQuestionsAction',
    questions: questions
  };
}

export function increaseGameRoundNumberAction(roundNumber) {
  return {
    type: 'increaseGameRoundNumberAction',
    roundNumber: roundNumber
  };
}

export function increaseQuestionNumberAction(questionNumber, maxQuestions) {
  return {
    type: 'increaseQuestionNumberAction',
    questionNumber: questionNumber,
    maxQuestions: maxQuestions
  };
}

export function createCurrentQuestionAction(currentQuestion, image, questionId) {
  return {
    type: 'createCurrentQuestionAction',
    currentQuestion: currentQuestion,
    currentImage: image,
    currentQuestionId: questionId
  };
}

export function createCurrentCategoryAction(currentQuestionCategory) {
  return {
    type: 'createCurrentCategoryAction',
    currentQuestionCategory: currentQuestionCategory
  };
}

export function createCurrentQuestionAnswerAction(currentQuestionAnswer) {
  return {
    type: 'createCurrentQuestionAnswerAction',
    currentQuestionAnswer: currentQuestionAnswer
  };
}

export function addTeamQuestionAnswerAction(allQuestionAnswers) {
  return {
    type: 'addTeamQuestionAnswerAction',
    allQuestionAnswers: allQuestionAnswers
  };
}

export function addLatePlayerToQueue(teamName: string, playerCode: string, teamId: string) {
  return {
    type: 'addLatePlayerToQueue',
    teamName,
    playerCode,
    teamId
  };
}

export function removeLatePlayerFromQueue(teamName: string) {
  return {
    type: 'removeLatePlayerFromQueue',
    teamName
  };
}

// Reducer:
const initialCreateGameState = {
  formValidation: false,
  gameRoom: null,
  gameRoomTeams: [],
  currentGameStatus: null,
  questionCategories: [],
  questions: [],
  roundNumber: undefined,
  questionNumber: undefined,
  currentQuestion: null,
  currentQuestionId: null,
  currentQuestionCategory: null,
  currentQuestionAnswer: null,
  allQuestionAnswers: [{}],
  latePlayersQueue: []
};

export function createGameReducer(state = initialCreateGameState, action) {
  let changes = null;
  switch (action.type) {
    case 'createGameFormValidationAction':
      changes = {
        formValidation: action.formValidation
      };
      return { ...state, ...changes };

    case 'createGameRoomAction':
      changes = {
        gameRoom: action.gameRoom
      };
      return { ...state, ...changes };

    case 'getGameRoomTeamsAction':
      changes = {
        gameRoomTeams: action.gameRoomTeams
      };
      return { ...state, ...changes };

    case 'createCurrentGameStatusAction':
      changes = {
        currentGameStatus: action.currentGameStatus
      };
      return { ...state, ...changes };

    case 'createGameQuestionCategoriesAction':
      changes = {
        questionCategories: action.questionCategories
      };
      return { ...state, ...changes };

    case 'createGameQuestionsAction':
      changes = {
        questions: action.questions
      };
      return { ...state, ...changes };

    case 'increaseGameRoundNumberAction':
      changes = {
        roundNumber: action.roundNumber
      };
      return { ...state, ...changes };

    case 'increaseQuestionNumberAction':
      changes = {
        questionNumber: action.questionNumber,
        maxQuestions: action.maxQuestions
      };
      return { ...state, ...changes };

    case 'createCurrentQuestionAction':
      changes = {
        currentQuestion: action.currentQuestion,
        currentImage: action.currentImage,
        currentQuestionId: action.currentQuestionId
      };
      return { ...state, ...changes };

    case 'createCurrentCategoryAction':
      changes = {
        currentQuestionCategory: action.currentQuestionCategory
      };
      return { ...state, ...changes };

    case 'addTeamQuestionAnswerAction':
      changes = {
        allQuestionAnswers: action.allQuestionAnswers
      };
      return { ...state, ...changes };

    case 'createCurrentQuestionAnswerAction':
      changes = {
        currentQuestionAnswer: action.currentQuestionAnswer
      };
      return { ...state, ...changes };

    case 'addLatePlayerToQueue':
      return { ...state, latePlayersQueue: [...state.latePlayersQueue, { teamName: action.teamName, playerCode: action.playerCode, teamId: action.teamId }] };

    case 'removeLatePlayerFromQueue':
      return { ...state, latePlayersQueue: state.latePlayersQueue.filter(q => q.teamName !== action.teamName) };

    default:
      return state;
  }
}
