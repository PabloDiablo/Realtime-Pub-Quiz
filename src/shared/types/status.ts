export enum GameStatus {
  NotSet = 'not_set',
  Lobby = 'lobby',
  ChooseCategory = 'choose_category',
  AskingQuestion = 'asking_question',
  ChooseQuestion = 'choose_question',
  RoundEnded = 'round_ended',
  QuestionClosed = 'question_closed',
  EndGame = 'end_game',
  QuizMasterLeft = 'quizmaster_left'
}

export enum RoundStatus {
  Open = 'open',
  AskingQuestion = 'asking_question',
  ChoosingQuestion = 'choosing_question',
  QuestionClosed = 'question_closed',
  Ended = 'round_ended'
}

export enum QuestionStatus {
  Open = 'open',
  Closed = 'closed',
  Ended = 'ended'
}

export enum TeamStatus {
  New = 'new',
  Success = 'success',
  Deleted = 'deleted',
  Pending = 'pending',
  Error = 'error'
}
