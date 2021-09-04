export interface IFileHash {
  path: string;
  files: Array<{
    name: string;
    crc: string;
    md5: string;
    size: number;
  }>
  zip?: true;
}
