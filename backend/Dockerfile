# Use Node.js 20 LTS Alpine for a small footprint
FROM node:20-alpine

# Install OpenSSL (required by Prisma on Alpine)
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (for better caching)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Generate Prisma client AND create the SQLite database
RUN npx prisma generate
RUN npx prisma db push

# Ensure the port is exposed
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "src/index.js"]
