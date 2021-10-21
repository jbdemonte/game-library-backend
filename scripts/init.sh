#!/bin/bash
set -e

# CONFIGURATION
FOLDER=game-library

# PATH HELPERS
SCRIPT_PATH="$(pwd -P)"
FOLDER_PATH=$SCRIPT_PATH/$FOLDER
REPOSITORY_PATH=$FOLDER_PATH/repositories

# BUILD FOLDERS
mkdir -p $REPOSITORY_PATH

# CLONING SOURCES
cd $REPOSITORY_PATH
git clone --depth 1 git@github.com:jbdemonte/game-library-backend.git backend
git clone --depth 1 https://github.com/jbdemonte/game-library-frontend.git frontend

# BUILD BACKEND
cd $REPOSITORY_PATH/backend
yarn --ignore-scripts
yarn build

# BUILD FRONTEND
cd $REPOSITORY_PATH/frontend
cp .env.example .env
yarn
yarn build

# COPY BUILT
mv $REPOSITORY_PATH/backend/.env.example $FOLDER_PATH/.env
mv $REPOSITORY_PATH/backend/screenscraper-credentials.example.json $FOLDER_PATH/screenscraper-credentials.json
mv $REPOSITORY_PATH/backend/package.json $FOLDER_PATH/
mv $REPOSITORY_PATH/backend/yarn.lock $FOLDER_PATH/
mv $REPOSITORY_PATH/backend/docker-compose.yml $FOLDER_PATH/
mv $REPOSITORY_PATH/backend/dist $FOLDER_PATH/dist
mv $REPOSITORY_PATH/frontend/build $FOLDER_PATH/public

cd $FOLDER_PATH
yarn install --production

# CLEANUP
rm -rf $REPOSITORY_PATH

echo "
Download the P/C XML No-Intro package from https://datomatic.no-intro.org/index.php?page=download&s=64&op=daily and unzip it.

Modify those files:
  - $FOLDER_PATH/.env
  - $FOLDER_PATH/screenscraper-credentials.json

Then start the server using:

  cd $FOLDER_PATH
  docker compose up -d
  yarn start

Then put some roms in the dropbox folder.
"
