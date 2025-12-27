# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build arguments for Vite (must be available at build time)
ARG VITE_PUBLIC_POSTHOG_KEY
ARG VITE_PUBLIC_POSTHOG_HOST

# Set as env vars for the build step
ENV VITE_PUBLIC_POSTHOG_KEY=$VITE_PUBLIC_POSTHOG_KEY
ENV VITE_PUBLIC_POSTHOG_HOST=$VITE_PUBLIC_POSTHOG_HOST

# Build the app
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built output
COPY --from=builder /app/.output ./.output

# Expose port (Railway provides PORT env var)
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", ".output/server/index.mjs"]
