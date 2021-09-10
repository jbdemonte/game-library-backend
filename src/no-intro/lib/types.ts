type Rom = {
  name: string;
  size: number;
  crc?: string;
  md5?: string;
  sha1?: string;
  merge?: string;
  status?: 'baddump'|'nodump'|'good'|'verified'; // default good
  date?: string;
}

type Release = {
  name: string;
  region: string;
  language?: string;
  date?: string;
  default: 'yes' | 'no'; // default no
}

type Game = {
  name: string;
  description?: string;
  cloneof?: string;
  release?: Release;
  roms: Rom[];
}

