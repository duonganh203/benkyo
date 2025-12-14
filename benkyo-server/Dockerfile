
FROM node:23-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .
RUN npm run build

FROM node:23-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/index.js"]


