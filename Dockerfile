# ===== Stage 1: install dependencies =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

# ===== Stage 2: production =====
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app ./ 

EXPOSE 3000

CMD ["node", "server.js"]