interface I_SS_Genre {
  id: string;
  nomcourt: string;
  principale: string;
  parentid: string;
  noms: Array<{ langue: string; text: string; }>;
}

export interface I_SS_Media {
  type: string;
  parent: string;
  url: string;
  region?: string;
  crc: string;
  md5: string;
  sha1: string;
  size: string;
  format: string;
  posx: string;
  posy: string;
  posw: string;
  posh: string;
  subparent: string;
  id: string;
}

export interface I_SS_Rom {
  id: string;
  romsize: string;
  romfilename: string;
  romnumsupport: string;
  romtotalsupport: string;
  romcloneof: string;
  romcrc: string;
  rommd5: string;
  romsha1: string;
  beta: string;
  demo: string;
  proto: string;
  trad: string;
  hack: string;
  unl: string;
  alt: string;
  best: string;
  netplay: string;
}

export interface I_SS_RomFound extends I_SS_Rom {
  romregions: string;
  romtype: string;
  romsupporttype: string;
  editeur: string;
  dates: {
    [date_x: string]: string
  };
}

export interface I_SS_Game {
  id: string;
  romid: string;
  notgame: 'true' | 'false';
  noms: Array<{ region: string; text: string; }>;
  regions: { shortname: string; };
  cloneof: string;
  systeme: { id: string; text: string; };
  editeur: { id: string; text: string; };
  developpeur: { id: string; text: string; };
  joueurs: { text: string };
  note: { text: string };
  topstaff: string;
  rotation: string;
  synopsis?: Array<{ langue: string; text: string; }>;
  classifications: Array<{ type: string; text: string; }>;
  dates: Array<{ region: string; text: string; }>;
  genres?: I_SS_Genre[];
  medias: I_SS_Media[];
  roms: I_SS_Rom[];
  rom?: I_SS_RomFound;
}