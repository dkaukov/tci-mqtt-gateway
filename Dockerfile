FROM node:14-alpine as base

WORKDIR /app
RUN apk add --no-cache tzdata eudev

COPY package.json ./

# Dependencies
FROM base as dependencies

COPY package-lock.json ./

RUN apk add --no-cache --virtual .buildtools make gcc g++ python3 linux-headers git bash && \
    npm ci --production && \
    apk del .buildtools

# Release
FROM base as release

COPY --from=dependencies /app/node_modules ./node_modules
COPY index.js ./
COPY config/ ./config/
COPY protocol/ ./protocol/
COPY ratu-v2/ ./ratu-v2/

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ARG COMMIT
RUN echo "{\"hash\": \"$COMMIT\"}" > .hash.json

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
