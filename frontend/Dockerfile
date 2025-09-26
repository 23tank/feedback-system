# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files from repo root
COPY ../package.json ../package-lock.json ./
RUN npm install

# Copy frontend code
COPY . . 

# Set environment variable
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE

# Build frontend
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configure nginx
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
