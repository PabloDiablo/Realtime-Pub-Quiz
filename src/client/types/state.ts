export interface GameRoomTeam {
  _id: string;
  approved: boolean;
  playerCode: string;
}

export interface GameRoomTeamWithAnswer extends GameRoomTeam {
  teamAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}
