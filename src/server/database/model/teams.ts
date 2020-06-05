import mongoose from 'mongoose';

export interface TeamSchema {
  name: string;
  approved: boolean;
  playerCode: string;
  gameRoom: string;
  rdbid: string;
}

//Create schema
export const teamScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    required: true
  },
  playerCode: {
    type: String
  },
  gameRoom: { type: mongoose.Schema.Types.String, ref: 'Games' },
  rdbid: {
    type: String
  }
});

teamScheme.index({ name: 1, rdbid: 1 });

//Create model
export default mongoose.model<TeamSchema & mongoose.Document>('Team', teamScheme);
