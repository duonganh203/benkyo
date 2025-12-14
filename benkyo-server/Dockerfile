
FROM node:23-alpine AS build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace package file
COPY benkyo-server/package.json ./benkyo-server/
COPY benkyo-client/package.json ./benkyo-client/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY benkyo-server ./benkyo-server

# Build the server
WORKDIR /app/benkyo-server
RUN npm run build

FROM node:23-alpine

WORKDIR /app

# Copy root package files for production install
COPY package.json package-lock.json ./
COPY benkyo-server/package.json ./benkyo-server/
COPY benkyo-client/package.json ./benkyo-client/

# Disable prepare script to prevent husky execution in production (husky is a devDep)
RUN sed -i 's/"prepare": ".*"/"prepare": ""/' benkyo-client/package.json

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application
COPY --from=build /app/benkyo-server/dist ./benkyo-server/dist

EXPOSE 3000

# Start from the root context or adjust path
CMD ["node", "benkyo-server/dist/index.js"]
