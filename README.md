# Game Library (backend)

## Disclaimer 

At first, my goal was to create a node script to manage my game library (removing duplicate roms). 

This is why I realised it as a draft and not as a professional structured project.  
Moving forward, I finally decided to add an express server and to develop a [frontend](https://github.com/jbdemonte/game-library-frontend) to see its content.

Finally, I got a working project targeting a local file systems (no S3 / Heroku), without a well-defined domain or any tests / CI 😱 😓.  

I swear, I usually do it right! 😇

## Installation

Copy `screenscraper-credentials.example.json` to `screenscraper-credentials.json` and modify it with your [screenscraper](https://www.screenscraper.fr/) user credentials.

Download the [P/C XML](https://datomatic.no-intro.org/index.php?page=download&s=64&op=daily) package from [datomatic.no-intro.org](https://datomatic.no-intro.org/) and unzip it.

Copy `.env.example` to `.env` and modify it.

### Development

When developing, backend and [frontend](https://github.com/jbdemonte/game-library-frontend) are started separately.

A [docker-compose.yml](docker-compose.yml) file allows setting up the MongoDB.

```shell
docker compose up -d
```

Install the dependencies using `yarn` (or `npm`):

```shell
yarn 
```

Start the development server (watch mode):
```shell
yarn start:dev
```

### Production

You can either clone and use it by your own, use a standalone build or use the docker build (preferred method).

#### Standalone

Quick start the project from the GitHub repositories:

```shell
wget -O - https://raw.githubusercontent.com/jbdemonte/game-library-backend/main/scripts/init.sh | bash
```

Or build both backend and frontend then move the build directories into a same app folder:
```
    app
      package.json
      yarn.lock
      .env
      --- dist     => backend
      --- public   => frontend
```

Start the server:
```shell
yarn start
```


#### Docker

Build the image from the backend repository. The frontend repository is cloned during the build.

```shell
yarn build:docker
```

The docker build uses the `.env.example` values as default one.

Run the image using environment variables and/or `.env` file.

Example: 
```shell
docker run -ti --rm \
  --mount type=bind,source="$(pwd)/screenscraper-credentials.json",target=/screenscraper-credentials.json,readonly \
  -v $(pwd)/dropzone:/dropzone \
  -v $(pwd)/roms:/roms \
  -v $(pwd)/scrap:/scrap \
  -v $(pwd)/data:/app/data \
  --env-file .env.docker \
  -p 3000:3000 \
  -e MONGODB_HOST=host.docker.internal \
  "game-library"
```

This command uses the following `.env.docker` file:
```dotenv
API_URL=/api
SCREENSCRAPER_SOFTNAME=XXX
SCREENSCRAPER_DEVID=XXX
SCREENSCRAPER_DEVPASSWORD=XXX
SCREENSCRAPER_REGION_ORDER=ss,fr,eu,us,wor,jp
```

## Informations

### Dropzone

The dropzone folder is initiated with a folder for each system (`nes`, `snes`...).

ROMs can be dropped either in the main folder if its system can be guessed based on its file extension (i.e.  `xxx.v64` => `n64`) or in its dedicated system folder.
When a rom is dropped in a sub-folder (e.g. `dropzone/n64`), the rom is associated to this system, there is no error detection.

ROMs can be compressed in `zip` or `7z`.

### ROMs

ROMs are zipped and stored in a dedicated folder, there is no risk to overwrite a rom file due to a duplicate file name.

When a ROM is processed, size, CRC and MD5 are calculated for the ROM file itself. 
If the rom file contains headers or some byte manipulations (i.e. byte swap for `v64` rom files for `n64`), size, CRC and MD5 are also calculated for the generic version of the ROM. 
All those hashed are used to avoid duplicate ROMs and to scrap game data.

The no-intro database is used at first scrap level to identify known clones.

#### Generic transformers

##### [NES transformer](src/headers/transformers/nes.transformer.ts)

NES roms can contain a 16 bytes header, which is removed to calculate hashes.

##### [FDS transformer](src/headers/transformers/fds.transformer.ts)

FDS roms can contain a 16 bytes header, which is removed to calculate hashes.

##### [SNES transformer](src/headers/transformers/snes.transformer.ts)

SNES roms can contain a 512 bytes header, which is removed to calculate hashes.

##### [N64 transformer](src/headers/transformers/n64.transformer.ts)

Nintendo 64 roms may be dumped in several byte order depending on the dumper tool (big endian, little endian, byte swapped or word swapped).

### Games

#### Screenscraper

Games are scrapped from [screenscraper](https://www.screenscraper.fr) database.

For now, this software does not have official software credentials required by screenscraper, for now, I use another tool credentials found on their github (not shared here for obvious reasons.).

This software also accepts several user [credentials](screenscraper-credentials.example.json) which are used randomly to avoid account limitation.

To avoid IP ban, this software use a proxy list scrapped from [free-proxy.cz](http://free-proxy.cz).

#### Misc

##### Game Gear's roms

Some Game Gear roms are using the `.sms` extension because they are Game Gear cartridge using the Game Gear's SMS-compatible mode.  
e.g. `Castle of Illusion Starring Mickey Mouse (US - EU).sms`   md5 = `16b6ea96908c17d4389a5907710a0f4e`

## Licence

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">
    <a property="dct:title" rel="cc:attributionURL" href="https://github.com/jbdemonte/game-library-front">Game Library (backend)</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https//jb.demonte.fr">Jean-Baptiste Demonte</a> is licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-NC-SA 4.0
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1">
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1">
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1">
        <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1">
    </a>
</p>
