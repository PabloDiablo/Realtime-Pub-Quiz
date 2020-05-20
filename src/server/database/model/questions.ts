import mongoose from 'mongoose';

import { QuestionStatus } from '../../../shared/types/status';

export interface QuestionSchema {
  vraag: string;
  image: string;
  antwoord: string;
  categorie_naam: string;
  status: QuestionStatus;
  round: mongoose.Schema.Types.ObjectId;
  availableQuestion: mongoose.Schema.Types.ObjectId;
}

//Create schema
export const questionSchema = new mongoose.Schema({
  vraag: {
    type: String
  },
  image: {
    type: String
  },
  antwoord: {
    type: String
  },
  categorie_naam: {
    type: String
  },
  status: {
    type: String
  },
  round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  availableQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'AvailableQuestion' }
});

questionSchema.index({ round: 1, status: 1 });

//Create model
export default mongoose.model<QuestionSchema & mongoose.Document>('Question', questionSchema);
