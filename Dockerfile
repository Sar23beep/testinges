# Production Multi-Stage Dockerfile for Google Cloud Run
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY app.js ./
COPY backend ./backend
COPY frontend ./frontend

EXPOSE 8080

USER node

CMD ["node", "app.js"]
