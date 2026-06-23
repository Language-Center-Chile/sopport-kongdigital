FROM docker.io/library/node:22-slim AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

RUN pnpm run build

FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=17000

EXPOSE 17000

CMD ["node", "dist/sopport-app/server/server.mjs"]
