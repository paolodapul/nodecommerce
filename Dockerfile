# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final stage
FROM node:20-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install
RUN npm install pm2 -g
USER node
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
ENV NODE_ENV=production
CMD ["pm2-runtime", "start", "dist/index.js", "--env", "production"]