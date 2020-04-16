import mongoose from 'mongoose';
import { QuestionSchema, questionScheme } from './question';

export interface RoundSchema extends mongoose.Document {
  ronde_status: string;
  categories: string[];
  vragen: QuestionSchema[];
}

//Create schema
export const roundScheme = new mongoose.Schema({
  ronde_status: {
    type: String
    // required: true,
  },
  categories: {
    type: Array,
    required: true
  },
  vragen: {
    type: [{ type: questionScheme, ref: 'Question' }]
  }
});

//Create model
export default mongoose.model<RoundSchema>('Round', roundScheme);
