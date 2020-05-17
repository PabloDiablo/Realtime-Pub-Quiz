export enum GameStatus {
  AskingQuestion = 'asking_question',
  ChoosingQuestion = 'choosing_question',
  RoundEnded = 'round_ended',
  QuestionClosed = 'question_closed'
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
