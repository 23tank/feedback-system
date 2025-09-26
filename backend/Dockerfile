FROM node:20-alpine
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install only backend dependencies
RUN npm install --prefix ./backend --omit=dev

# Copy backend source
COPY backend ./ 

EXPOSE 4000
CMD ["node", "src/index.js"]
