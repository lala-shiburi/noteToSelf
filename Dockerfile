FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci

COPY client ./client
COPY server ./server

ARG VITE_API_URL=https://nts.lalacodes.tech
ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

RUN npm --workspace client run build
RUN ./node_modules/.bin/tsc --project server/tsconfig.json

FROM node:22-alpine AS frontend

WORKDIR /app
COPY --from=build /app/client/dist ./dist
COPY frontend-server.mjs ./frontend-server.mjs

EXPOSE 80
CMD ["node", "frontend-server.mjs"]

FROM node:22-alpine AS api

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev

COPY --from=build /app/server/dist ./server/dist

EXPOSE 5000
CMD ["node", "server/dist/index.js"]
