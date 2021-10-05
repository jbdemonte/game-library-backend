
# Installation

copy `screenscraper-credentials.example.json` to `screenscraper-credentials.json` and modify it.

copy `.env.example` to `.env` and modify it.

Download the [P/C XML](https://datomatic.no-intro.org/index.php?page=download&s=64&op=daily) package from [datomatic.no-intro.org](https://datomatic.no-intro.org/) and unzip it into the [data](./data) folder keeping its own folder.

# Dropzone

The dropzone folder is initiated with a folder for each system (`nes`, `snes`...).

ROMs can be dropped either in the main folder if its system can be guessed based on its file extension (i.e.  `xxx.v64` => `n64`) or in its dedicated system folder.
When a rom is dropped in a sub-folder (e.g. `dropzone/n64`), the rom is associated to this system, there is no error detection.

ROMs can be compressed in `zip` or `7z`.

# ROMs

ROMs are zipped and stored in a dedicated folder, there is no risk to overwrite a rom file because of duplicate file name.

When a ROM is processed, size, CRC and MD5 are calculated for the ROM file itself. 
If the rom file contains headers or some byte manipulations (i.e. byte swap for `v64` rom files for `n64`), size, CRC and MD5 are also calculated for the generic version of the ROM. 
All those hashed are used to avoid duplicate ROMs and to scrap game data.

The no-intro database is used at first scrap level to identify known clones.

## Generic transformer

### [NES transformer](src/headers/transformers/nes.transformer.ts)

NES roms can contain a 16 bytes header, which is removed to calculate hashes.

### [FDS transformer](src/headers/transformers/fds.transformer.ts)

FDS roms can contain a 16 bytes header, which is removed to calculate hashes.

### [SNES transformer](src/headers/transformers/snes.transformer.ts)

SNES roms can contain a 512 bytes header, which is removed to calculate hashes.

### [N64 transformer](src/headers/transformers/n64.transformer.ts)

Nintendo 64 roms may be dump in several byte order depending on the dumper tool (big endian, little endian, byte swapped or word swapped).

# Games

## Screenscraper

Games are scrapped from [screenscraper](https://www.screenscraper.fr) database.

For now, this software does not have official software credentials required by screenscraper, for now, I use another tool credentials found on their github (not shared here for obvious reasons.).

This software also accepts several user [credentials](screenscraper-credentials.example.json) which are used randomly to avoid account limitation.

To avoid IP ban, this software use a proxy list scrapped from [free-proxy.cz](http://free-proxy.cz).

# Misc

## Game Gear's roms

Some Game Gear roms are using the `.sms` extension because they are Game Gear cartridge using the Game Gear's SMS-compatible mode.  
e.g. `Castle of Illusion Starring Mickey Mouse (US - EU).sms`   md5 = `16b6ea96908c17d4389a5907710a0f4e`

# Licence

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">
    <a property="dct:title" rel="cc:attributionURL" href="https://github.com/jbdemonte/game-library-front">Game Library (backend)</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https//jb.demonte.fr">Jean-Baptiste Demonte</a> is licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-NC-SA 4.0
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1">
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1">
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1">
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1">
    </a>
</p>
