# ==========================================
# STAGE 1: Heavy Node Environment to Build Code
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency configs
COPY package*.json ./
RUN npm ci

# Copy source code and build Next.js application
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
