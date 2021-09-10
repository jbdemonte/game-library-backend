import { Document, model, Model, Schema } from 'mongoose';

export interface IGame {
  system: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameDocument extends IGame, Document {}

export interface GameModel extends Model<GameDocument> {}

const GameSchema = new Schema<GameDocument, GameModel>(
  {
    system: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);


export const gameModel = model<GameDocument, GameModel>('Game', GameSchema);
