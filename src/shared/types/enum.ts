export enum QuestionType {
  FreeText = 'text',
  MultipleChoice = 'multi'
}

export enum JoinGameErrorReason {
  Ok,
  MissingValues,
  GameRoomNotFound,
  PlayerCodeInvalid,
  TeamNameTaken
}

export enum SubmitAnswerErrorReason {
  Ok,
  MissingAnswer,
  QuestionClosed,
  PlayerNotAuthorised
}
