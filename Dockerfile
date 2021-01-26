FROM node:12-alpine as build

RUN apk add --no-cache curl bash

RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY server ./server
COPY types ./types

RUN yarn install --pure-lockfile --non-interactive

WORKDIR /usr/src/app/server
RUN yarn build && npm prune --production && rm -rf node_modules/typescript
RUN /usr/local/bin/node-prune ../node_modules

FROM node:12-alpine

WORKDIR /usr/src/app/server

COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/yarn.lock /usr/src/app/server/yarn.lock
COPY --from=build /usr/src/app/server/package.json /usr/src/app/server/package.json
COPY --from=build /usr/src/app/server/lib /usr/src/app/server/lib

ENV NODE_ENV production

CMD ["yarn", "start"]