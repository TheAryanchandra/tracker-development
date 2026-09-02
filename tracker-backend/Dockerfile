FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Set environment variables
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
