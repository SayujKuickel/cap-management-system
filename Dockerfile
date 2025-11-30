# ---- Base builder image ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN pnpm build

# ---- Production runner image ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Next.js will read this and listen on this port
ENV PORT=3005

# Copy built app and node_modules from builder
COPY --from=builder /app ./

# Expose the port the app will run on
EXPOSE 3005

# Start the app (uses "start": "next start" from package.json)
CMD ["pnpm", "start"]
