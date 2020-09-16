export enum GameStatus {
  NotStarted = 'not_started',
  Lobby = 'lobby',
  RoundIntro = 'round_intro',
  PreQuestion = 'pre_questions',
  AskingQuestion = 'asking_question',
  QuestionClosed = 'question_closed',
  RoundEnded = 'round_ended',
  EndGame = 'end_game'
}

export enum TeamStatus {
  Unknown = 'unknown',
  Waiting = 'waiting',
  Joined = 'joined',
  Blocked = 'blocked',
  Quit = 'quit'
}
