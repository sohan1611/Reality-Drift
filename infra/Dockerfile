# Use Node.js LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 8080

# Start server
CMD [ "node", "src/index.js" ]
