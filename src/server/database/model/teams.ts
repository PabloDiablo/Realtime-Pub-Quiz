import mongoose from 'mongoose';

export interface TeamSchema extends mongoose.Document {
  name: string;
  approved: boolean;
  playerCode: string;
  gameRoom: string;
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
  gameRoom: { type: mongoose.Schema.Types.String, ref: 'Games' }
});

teamScheme.index({ name: 1 });

//Create model
export default mongoose.model<TeamSchema>('Team', teamScheme);
