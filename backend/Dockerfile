FROM node:20-alpine
WORKDIR /app

# Copy backend package files only
COPY backend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY backend/ ./

EXPOSE 4000
CMD ["node", "src/index.js"]

