FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

EXPOSE 4000
CMD ["node", "src/index.js"]
