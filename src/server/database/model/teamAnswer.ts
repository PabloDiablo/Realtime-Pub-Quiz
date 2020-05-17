import mongoose from 'mongoose';

export interface TeamAnswerSchema extends mongoose.Document {
  team: mongoose.Schema.Types.ObjectId;
  gegeven_antwoord: string;
  correct: boolean;
  timestamp: number;
  question: mongoose.Schema.Types.ObjectId;
}

//Create schema
export const teamAnswerSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  gegeven_antwoord: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean
  },
  timestamp: {
    type: Number
  },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
});

teamAnswerSchema.index({ team: 1, question: 1 });

//Create model
export default mongoose.model<TeamAnswerSchema>('TeamAnswers', teamAnswerSchema);
