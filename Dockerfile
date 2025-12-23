FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci

# Copy server source
COPY server/src ./src

# Build server
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY server/package*.json ./
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/server/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]

