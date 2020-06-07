import { GameResponse } from './response';

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

export interface HasSessionResponse extends GameResponse {
  hasSession: boolean;
  gameRoom: string;
}
