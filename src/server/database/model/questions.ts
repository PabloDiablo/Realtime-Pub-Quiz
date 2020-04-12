import mongoose from 'mongoose';

export interface QuestionsSchema extends mongoose.Document {
  question: string;
  image: string;
  answer: string;
  category: string;
}

//Create schema
export const questionsSchema = new mongoose.Schema({
  question: {
    type: String
    // required: true,
  },
  image: {
    type: String
  },
  answer: {
    type: String
    // required: true,
  },
  category: {
    type: String
    // required: true,
  }
});

//Create model
export default mongoose.model<QuestionsSchema>('Questions', questionsSchema);
