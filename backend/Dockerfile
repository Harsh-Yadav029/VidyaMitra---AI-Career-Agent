# ============================================================
#  VidyaMitra Backend — Dockerfile
# ============================================================

FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files first (layer cache optimization)
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/resumes logs

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
