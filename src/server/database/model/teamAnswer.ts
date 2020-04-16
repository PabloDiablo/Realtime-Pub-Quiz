import mongoose from 'mongoose';

export interface TeamAnswerSchema extends mongoose.Document {
  team_naam: string;
  gegeven_antwoord: string;
  correct: boolean;
}

//Create schema
export const teamAnswerSchema = new mongoose.Schema({
  team_naam: {
    type: String,
    required: true
  },
  gegeven_antwoord: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean
  }
});

//Create model
export default mongoose.model<TeamAnswerSchema>('TeamAnswers', teamAnswerSchema);
