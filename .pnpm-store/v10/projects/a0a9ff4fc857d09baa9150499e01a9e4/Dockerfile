# Production Dockerfile for NestJS Backend
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

# Install pnpm
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Build
FROM node:20-alpine AS build

# Install pnpm
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 3: Production
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm@latest

# Install required dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy package.json for scripts
COPY --chown=nestjs:nodejs package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start production server
CMD ["node", "dist/main"]
