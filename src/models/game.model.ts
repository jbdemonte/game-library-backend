import { Document, model, Model, Schema } from 'mongoose';

export interface IMedia {
  type: string;
  region?: string;
  format: string;
  file: string;
}

export interface MediaDocument extends IMedia, Document {}

const MediaSchema = new Schema<MediaDocument>(
  {
    type: { type: String, required: true},
    region: { type: String},
    format: { type: String, required: true},
    file: { type: String, required: true},
  },
  { _id : false },
)

export interface IGame {
  system: string;
  name: string;
  screenscraperId?: number;
  genres?: string[],
  synopsis?: string;
  grade?: number;
  players?: number;
  medias: IMedia[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameDocument extends IGame, Document {}

export interface GameModel extends Model<GameDocument> {}

const GameSchema = new Schema<GameDocument, GameModel>(
  {
    system: { type: String, required: true },
    name: { type: String, required: true },
    screenscraperId: { type: Number },
    genres: { type: [String] },
    synopsis: { type: String },
    grade: { type: Number },
    players: { type: Number },
    medias: { type: [MediaSchema], default: [] },
  },
  { timestamps: true }
);

GameSchema.index({ screenscraperId: 1 });

export const gameModel = model<GameDocument, GameModel>('Game', GameSchema);
