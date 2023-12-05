FROM oven/bun:slim as base
WORKDIR /usr/src/app

FROM base AS install
ARG NODE_VERSION=20
RUN apt update \
    && apt install -y curl
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

COPY ./package.json ./bun.lockb ./
COPY ./src ./
COPY ./prisma ./prisma
RUN bun install
RUN bun install --production
RUN bun prisma generate

FROM base AS release
COPY --from=install /usr/src/app/ .

ENV NODE_ENV production

USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]