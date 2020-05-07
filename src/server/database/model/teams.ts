import mongoose from 'mongoose';

export interface TeamSchema extends mongoose.Document {
  _id: string;
  approved: boolean;
  round_score: number;
  team_score: number;
  playerCode: string;
}

//Create schema
export const teamScheme = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    required: true
  },
  round_score: {
    type: Number,
    required: true
  },
  team_score: {
    type: Number,
    required: true
  },
  playerCode: {
    type: String
  }
});

//Create model
export default mongoose.model<TeamSchema>('Team', teamScheme);
