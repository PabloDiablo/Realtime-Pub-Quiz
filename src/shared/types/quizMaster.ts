import { GameResponse, OkResponse, BadResponse } from './response';
import { QuestionType } from './enum';
import { TeamStatus } from './status';

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
  status: TeamStatus;
}

export type TeamStatusResponse = OkResponse | BadResponse;

export interface GameStatusRequest {
  gameRoom: string;
  status: string;
}

export type GameStatusResponse = OkResponse | BadResponse;

interface GameInfoResponseBase extends OkResponse {
  id: string;
  gameRoom: string;
  correctPoints: number;
  randomPrizePosition: number;
  fastAnswerMethod: 'none' | 'fastsingle' | 'fastx' | 'sliding';
  bonusPoints: number;
  bonusNumTeams: number;
  authorisedPlayerCodes: string[];
  rounds: {
    id: string;
    name: string;
    questions: string[];
  }[];
}

export type GameInfoResponse = GameInfoResponseBase | BadResponse;

export interface GameSettingsRequest {
  gameRoom: string;
  correctPoints: number;
  randomPrizePosition: number;
  fastAnswerMethod: 'none' | 'fastsingle' | 'fastx' | 'sliding';
  bonusPoints: number;
  bonusNumTeams: number;
}

export type GameSettingsResponse = OkResponse | BadResponse;

export interface GamePlayerCodesRequest {
  gameRoom: string;
  playerCodes: string[];
}

export type GamePlayerCodesResponse = OkResponse | BadResponse;

export interface GameRoundsRequest {
  gameRoom: string;
  rounds: {
    id?: string;
    name: string;
    questions: string[];
  }[];
  deleteQueue: string[];
}

export type GameRoundsResponse = OkResponse | BadResponse;

interface AvailableQuestionsResponseBase extends OkResponse {
  questions: {
    id: string;
    type: QuestionType;
    text: string;
    image?: string;
    answer: string;
    category: string;
    possibleOptions?: string[];
  }[];
}

export type AvailableQuestionsResponse = AvailableQuestionsResponseBase | BadResponse;

export interface CreateQuestionRequest {
  type: QuestionType;
  text: string;
  image?: string;
  answer: string;
  category: string;
  possibleOptions?: string[];
}

export type CreateQuestionResponse = OkResponse | BadResponse;

export interface EditQuestionRequest {
  id: string;
  type: QuestionType;
  text: string;
  image?: string;
  answer: string;
  category: string;
  possibleOptions?: string[];
}

export type EditQuestionResponse = OkResponse | BadResponse;

interface GetRoundsAndQuestionsInGameResponseBase extends OkResponse {
  rounds: {
    id: string;
    name: string;
    questions: {
      id: string;
      text: string;
      answer: string;
    }[];
  }[];
}

export type GetRoundsAndQuestionsInGameResponse = GetRoundsAndQuestionsInGameResponseBase | BadResponse;

export type NextActionResponse = OkResponse | BadResponse;

export interface SetAnswerStateRequest {
  teamAnswerId: string;
  isCorrect: boolean;
}

export type SetAnswerStateResponse = OkResponse | BadResponse;

interface GetAllAnswersForQuestionResponseBase extends OkResponse {
  answers: {
    id: string;
    gameId: string;
    questionId: string;
    teamId: string;
    timestamp: number;
    answer: string;
    isCorrect?: boolean;
  }[];
}

export type GetAllAnswersForQuestionResponse = GetAllAnswersForQuestionResponseBase | BadResponse;
