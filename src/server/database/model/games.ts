import mongoose from 'mongoose';

export interface GamesSchema extends mongoose.Document {
  _id: string;
  game_status: string;
}

//Create schema
const gamesSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  game_status: {
    type: String
  }
});

//Create model
export default mongoose.model<GamesSchema>('Games', gamesSchema);
