# Production Multi-Stage Dockerfile for Vaultonaut Frontend SPA
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location = /index.html { \
        root /usr/share/nginx/html; \
        add_header Cache-Control "no-store, no-cache, must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
