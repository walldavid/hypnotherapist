# Stage 1: Build React frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
WORKDIR /app/server
ENV NODE_ENV=production
# Cloud Run sets PORT=8080 automatically
EXPOSE 8080
CMD ["node", "server.js"]
