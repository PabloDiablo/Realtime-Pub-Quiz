import mongoose from 'mongoose';

import { GameStatus } from '../../../shared/types/status';

export interface GamesSchema extends mongoose.Document {
  _id: string;
  game_status: GameStatus;
}

//Create schema
const gamesSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  game_status: {
    type: String
  }
});

//Create model
export default mongoose.model<GamesSchema>('Games', gamesSchema);
