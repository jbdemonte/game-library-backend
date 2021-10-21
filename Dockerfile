FROM node:14.18.1-buster AS build

###################################################
##                BUILD BACKEND
###################################################

ENV NODE_ENV="development"

WORKDIR /backend

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY tsconfig.json .
COPY .env.example .env

ADD ./src ./src

RUN yarn build

###################################################
##                BUILD FRONTEND
###################################################

ARG FRONT_TAG=NONE
ENV REACT_APP_API_URL="/api"

RUN git clone --depth 1 https://github.com/jbdemonte/game-library-frontend.git /frontend

WORKDIR /frontend

RUN yarn

RUN yarn build

###################################################
##              BUILD FINAL IMAGE
###################################################

ENV NODE_ENV="production"

FROM node:14.18.1-alpine3.14

WORKDIR /app

ADD ./tmp/proxies.json /tmp/

COPY --from=build /backend/package.json /app/
COPY --from=build /backend/yarn.lock /app/
COPY --from=build /backend/.env /app/

COPY --from=build /backend/dist /app/dist
COPY --from=build /frontend/build /app/public

# install ignoring script because of p7zip basically requires build-essentials to build the binary
# so, we reuse the binary from the previous build
RUN yarn install --production --ignore-scripts
COPY --from=build /backend/node_modules/p7zip/bin /app/node_modules/p7zip/bin

EXPOSE 3000

VOLUME ["/screenscraper-credentials.json", "/app/data"]
VOLUME ["/dropzone", "/roms", "/tmp", "/scrap"]

CMD [ "yarn", "start"]
