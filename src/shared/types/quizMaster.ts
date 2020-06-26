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

export interface CreateGameRequest {
  roomName: string;
  correctPoints: number;
  randomPrizePosition?: number;
  fastAnswerMethod: 'none' | 'fastsingle' | 'fastx' | 'sliding';
  bonusPoints?: number;
  bonusNumTeams?: number;
}

interface CreateGameResponseBase extends OkResponse {
  validationError: boolean;
  gameRoomAlreadyExists: boolean;
}

export type CreateGameResponse = CreateGameResponseBase | BadResponse;

interface HasSessionResponseBase extends OkResponse {
  hasSession: boolean;
}

export type HasSessionResponse = HasSessionResponseBase | BadResponse;

interface LoginResponseBase extends OkResponse {
  isPasscodeCorrect: boolean;
}

export type LoginResponse = LoginResponseBase | BadResponse;

export interface TeamStatusRequest {
  gameRoom: string;
  teamId: string;
  status: 'waiting' | 'joined' | 'blocked';
}

export type TeamStatusResponse = OkResponse | BadResponse;

export interface GameStatusRequest {
  gameRoom: string;
  status: string;
}

export type GameStatusResponse = OkResponse | BadResponse;
