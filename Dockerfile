# ==========================================
# STAGE 1: Heavy Node Environment to Build Code
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

# Pehle dependencies copy aur install karein (for caching efficiency)
COPY package*.json ./
RUN npm ci

# Poora code copy karein
COPY . .

# Static HTML/CSS/JS compile karein
RUN npm run build

# ==========================================
# STAGE 2: Ultra-Lightweight Nginx Runtime
# ==========================================
FROM nginx:stable-alpine AS runner

# Custom Nginx configuration apply karein
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Stage 1 (builder) se sirf static assets copy karein
# NOTE: Agar Next.js hai to /app/dist ko badal kar /app/out kar dein
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
