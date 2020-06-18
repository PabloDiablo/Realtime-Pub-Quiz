import { GameResponse, OkResponse, BadResponse } from './response';

export interface CategoriesResponse extends GameResponse {
  categories: string[];
}

export interface QuestionsResponse extends GameResponse {
  questions: {
    _id: string;
    question: string;
    image: string;
    answer: string;
    category: string;
  }[];
}

export interface TeamSubmittedAnswer {
  team: {
    _id: string;
    name: string;
    approved: boolean;
    playerCode: string;
    gameRoom: string;
  };
  gegeven_antwoord: string;
  correct: boolean;
  timestamp: number;
  question: string;
}

export interface QuestionAnswersResponse extends GameResponse {
  question: string;
  correctAnswer: string;
  answers: TeamSubmittedAnswer[];
}

export interface NewGameResponse extends GameResponse {
  passcodeIncorrect: boolean;
  gameRoomNameAccepted: boolean;
  gameRoomName: string;
}

export interface MarkAnswerResponse extends GameResponse {
  answers: TeamSubmittedAnswer[];
}

interface HasSessionResponseBase extends OkResponse {
  hasSession: boolean;
}

export type HasSessionResponse = HasSessionResponseBase | BadResponse;

interface LoginResponseBase extends OkResponse {
  isPasscodeCorrect: boolean;
}

export type LoginResponse = LoginResponseBase | BadResponse;
