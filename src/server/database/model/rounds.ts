import mongoose from 'mongoose';

import { RoundStatus } from '../../../shared/types/status';

export interface RoundSchema {
  ronde_status: RoundStatus;
  categories: string[];
  gameRoom: string;
}

//Create schema
export const roundScheme = new mongoose.Schema({
  ronde_status: {
    type: String
  },
  categories: {
    type: Array,
    required: true
  },
  gameRoom: { type: mongoose.Schema.Types.String, ref: 'Games' }
});

roundScheme.index({ gameRoom: 1, ronde_status: 1 });

//Create model
export default mongoose.model<RoundSchema & mongoose.Document>('Round', roundScheme);
