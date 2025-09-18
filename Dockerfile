# Multi-stage production Dockerfile for Sanzo Color Advisor
# Optimized for performance, security, and minimal image size

# ===================================
# Stage 1: Build Dependencies
# ===================================
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Install security updates and required system packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S sanzo -u 1001

# Copy package files for dependency resolution
COPY package*.json ./

# Install dependencies with optimizations
RUN npm ci --only=production --omit=dev && npm cache clean --force

# ===================================
# Stage 2: Build Application
# ===================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY tests/ ./tests/

# Run build process if exists
RUN npm run build 2>/dev/null || echo "No build script found, using source directly"

# Run tests to ensure build quality
RUN npm run test

# ===================================
# Stage 3: Production Image
# ===================================
FROM node:18-alpine AS production

# Install security updates and minimal required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S sanzo -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=sanzo:nodejs /app/node_modules ./node_modules/

# Copy application files from builder stage
COPY --from=builder --chown=sanzo:nodejs /app/src ./src/
COPY --from=builder --chown=sanzo:nodejs /app/public ./public/
COPY --from=builder --chown=sanzo:nodejs /app/package*.json ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /tmp/sanzo-cache && \
    chown -R sanzo:nodejs /app /tmp/sanzo-cache

# Set environment variables for production
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NPM_CONFIG_LOGLEVEL=warn \
    NODE_OPTIONS="--max-old-space-size=512" \
    UV_THREADPOOL_SIZE=4

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER sanzo

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]

# Metadata labels
LABEL maintainer="Claude Code" \
      description="Sanzo Color Advisor API - AI-powered color recommendations" \
      version="1.0.0" \
      org.opencontainers.image.source="https://github.com/user/sanzo-color-advisor" \
      org.opencontainers.image.documentation="https://github.com/user/sanzo-color-advisor/README.md" \
      org.opencontainers.image.licenses="MIT"