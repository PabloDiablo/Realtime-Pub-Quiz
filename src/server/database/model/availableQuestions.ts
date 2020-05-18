import mongoose from 'mongoose';

export interface AvailableQuestionSchema extends mongoose.Document {
  question: string;
  image: string;
  answer: string;
  category: string;
}

//Create schema
export const availableQuestionSchema = new mongoose.Schema({
  question: {
    type: String
  },
  image: {
    type: String
  },
  answer: {
    type: String
  },
  category: {
    type: String
  }
});

//Create model
export default mongoose.model<AvailableQuestionSchema>('AvailableQuestion', availableQuestionSchema);
