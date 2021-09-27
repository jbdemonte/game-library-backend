export interface IFileHash {
  name: string;
  crc: string;
  md5: string;
  size: number;
  generic?: {
    crc: string;
    md5: string;
    size: number;
  };
}
