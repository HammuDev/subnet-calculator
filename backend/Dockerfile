# ==========================================
# STAGE 1: Heavy Node Environment to Install
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ==========================================
# STAGE 2: Lightweight Runner
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY server.js subnetCalc.js ./

EXPOSE 5000
CMD ["npm", "start"]
