
FROM node:23-alpine AS build
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files (REQUIRED for npm ci to work with root lockfile)
COPY benkyo-client/package.json ./benkyo-client/

# Install dependencies (from root)
RUN npm ci

# Copy source code
COPY benkyo-client ./benkyo-client

# Build the client
WORKDIR /app/benkyo-client
RUN npm run build

FROM nginx:stable-alpine

# Copy nginx config
COPY benkyo-client/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/benkyo-client/dist /usr/share/nginx/html
