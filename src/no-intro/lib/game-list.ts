import { xml2js } from 'xml-js';
import { promises as fs } from 'fs';

type KeysWithValsOfType<T, V> = keyof { [ P in keyof Required<T> as Required<T>[P] extends V ? P : never ] : P };

type RomStrProps = KeysWithValsOfType<Omit<Rom, 'status'>, string>

type GameStrProps = KeysWithValsOfType<Game, string>;

function isGameStrProp(name: any) : name is GameStrProps {
  const keys: GameStrProps[] = ['description'];
  return keys.includes(name);
}

function isGameAttribute(name: any) : name is GameStrProps {
  const keys: GameStrProps[] = ['cloneof'];
  return keys.includes(name);
}

export async function getGameList(datPath: string): Promise<Game[]> {
  const xml = await fs.readFile(datPath, 'utf-8');
  const data: any = xml2js(xml, {
    compact: false,
    trim: true,
    alwaysArray: true,
    alwaysChildren: true,
    attributesKey: 'attr',
    elementsKey: 'content',
    textKey: 'content',
    nameKey: 'tag',
  });

  const datafile: any = data.content.find((item: any) => item.tag === 'datafile');

  const games = datafile.content.filter((item: any)  => item.tag === 'game');

  return games.map((data: any) => {
    const game: Game = {
      name: data.attr.name,
      roms: []
    };

    for(const [key, value] of Object.entries(data.attr)) {
      if (isGameAttribute(key)) {
        game[key] = value as any;
      }
    }

    for (const item of data.content) {
      const tag: string = item.tag;
      if (isGameStrProp(tag)) {
        game[tag] = item.content[0].content as string;
      }
      if (tag === 'rom') {
        const rom: Rom = {
          name: item.attr.name,
          size: parseInt(item.attr.size),
          status: item.attr.status || 'good',
        };
        for (const key of ['crc', 'md5', 'sha1', 'date', 'merge'] as RomStrProps[]) {
          if (item.attr[key]) {
            rom[key] = item.attr[key] as string;
          }
        }
        game.roms.push(rom);
      }
    }
    return game;
  });
}


