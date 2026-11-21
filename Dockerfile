# syntax=docker/dockerfile:1
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun run build

FROM base AS release
COPY --chown=bun:bun --from=install /temp/dev/node_modules node_modules
COPY --chown=bun:bun --from=prerelease /usr/src/app .

USER bun
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
EXPOSE 3000/tcp

CMD ["bun", "run", "docker:start"]