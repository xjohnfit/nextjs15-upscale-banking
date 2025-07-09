# ---------- Stage 1: Install dependencies ----------
FROM node:20.12.2-alpine AS deps
WORKDIR /app

# Upgrade packages
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm install --production

# ---------- Stage 2: Build the app ----------
FROM node:20.12.2-alpine AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV NODE_ENV=production
RUN npm run build

# ---------- Stage 3: Create minimal runtime image ----------
FROM node:20.12.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]