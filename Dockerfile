# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final stage
FROM node:20-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
RUN npm install pm2 -g
RUN mkdir -p /app/logs && chown -R node:node /app
USER node
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
ENV NODE_ENV=production
CMD ["pm2-runtime", "start", "dist/src/index.js", "--name", "my-app", "--env", "production", "--output", "/app/logs/output.log", "--error", "/app/logs/error.log"]