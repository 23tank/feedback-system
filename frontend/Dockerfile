# Stage 1: Build frontend
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files (since lockfile is at root)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy everything
COPY . ./

# Set API base
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE

# Build the frontend
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# Copy built files from previous stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Nginx config for SPA routing
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
