# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the React app with Docker-specific config
RUN npx vite build --config vite.config.docker.ts

# Production Stage - Serve with nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built React app from builder stage
# Note: Vite config builds to ../TodoApi/wwwroot, but we want dist for Docker
COPY --from=builder /app/dist .

# Simple nginx config for serving React SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]