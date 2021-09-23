import { Document, model, Model, Schema, Types } from 'mongoose';

export interface IUnheadered {
  crc: string;
  md5: string;
  size: number;
}

export interface UnheaderedDocument extends IUnheadered, Document {}

const UnheaderedSchema = new Schema<UnheaderedDocument>(
  {
    crc: { type: String, required: true},
    md5: { type: String, required: true},
    size: { type: Number, required: true},
  },
  { _id : false },
);

export interface IFile {
  name: string;
  crc: string;
  md5: string;
  size: number;
  unheadered?: IUnheadered;
}
export interface FileDocument extends IFile, Document {}

const FileSchema = new Schema<FileDocument>(
  {
    name: { type: String, required: true},
    crc: { type: String, required: true},
    md5: { type: String, required: true},
    size: { type: Number, required: true},
    unheadered: { type: UnheaderedSchema },
  },
  { _id : false },
);

export interface IRom {
  game: Types.ObjectId | null;
  system: string;
  archive: IFile;
  files: IFile[];
  lastScrap: Date | null;
}

export interface RomDocument extends IRom, Document {}

export interface RomModel extends Model<RomDocument> {}

const RomSchema = new Schema<RomDocument, RomModel>({
  game: { type: Schema.Types.ObjectId, ref: "Game", default: null },
  system: { type: String, required: true },
  archive: { type: FileSchema, required: true },
  files: { type: [FileSchema], required: true, default: []},
  lastScrap: { type: Date, default: null },
});

RomSchema.index({ system: 1 });
RomSchema.index({ 'archive.crc': 1 });
RomSchema.index({ 'archive.md5': 1 });
RomSchema.index({ 'files.crc': 1 });
RomSchema.index({ 'files.md5': 1 });
RomSchema.index({ 'files.unheadered.crc': 1 });
RomSchema.index({ 'files.unheadered.md5': 1 });
RomSchema.index({ game: 1, lastScrap: -1 });

export const romModel = model<RomDocument, RomModel>('Rom', RomSchema);
