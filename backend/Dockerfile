# Use Node base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 4000

# Start the backend
CMD ["npm", "start"]
