import mongoose from 'mongoose';
import { TeamSchema, teamScheme } from './teams';
import { RoundSchema, roundScheme } from './rounds';

export interface GamesSchema extends mongoose.Document {
  _id: string;
  game_status: string;
  teams: TeamSchema[];
  rondes: RoundSchema[];
}

//Create schema
const gamesSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
    // unique: true,
  },
  game_status: {
    type: String
    // required: true,
  },
  teams: {
    type: [{ type: teamScheme, ref: 'Team' }]
  },
  rondes: {
    type: [{ type: roundScheme, ref: 'Round' }]
  }
});

//Create model
export default mongoose.model<GamesSchema>('Games', gamesSchema);
