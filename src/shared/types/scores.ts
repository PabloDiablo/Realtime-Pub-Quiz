import { GameResponse } from './response';

export interface ScoresResponse extends GameResponse {
  gameRoomName: string;
  teams: Record<string, number>;
  rounds: Record<number, RoundScore>;
}

interface TeamScore {
  teamName: string;
  answer: string;
  isCorrect?: boolean;
}

interface QuestionScore {
  question: string;
  answer: string;
  teams: TeamScore[];
}

interface RoundScore {
  category: string;
  questionsCount: number;
  teamTotals: Record<string, number>;
  questions: QuestionScore[];
}
