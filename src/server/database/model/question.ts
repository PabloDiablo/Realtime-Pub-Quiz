import mongoose from 'mongoose';
import { TeamAnswerSchema, teamAnswerSchema } from './teamAnswer';

export interface QuestionSchema extends mongoose.Document {
  vraag: string;
  image: string;
  antwoord: string;
  categorie_naam: string;
  team_antwoorden: TeamAnswerSchema[];
}

//Create schema
export const questionScheme = new mongoose.Schema({
  vraag: {
    type: String
    // required: true,
  },
  image: {
    type: String
  },
  antwoord: {
    type: String
    // required: true,
  },
  categorie_naam: {
    type: String
    // required: true
  },
  team_antwoorden: {
    type: [{ type: teamAnswerSchema, ref: 'TeamAnswer' }]
  }
});

//Create model
export default mongoose.model<QuestionSchema>('Question', questionScheme);
