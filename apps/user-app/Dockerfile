# Base Node image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

WORKDIR /usr/src/app

# Copy lockfile and package config files
COPY package.json package-lock.json turbo.json tsconfig.json .npmrc ./
COPY apps/user-app/package.json ./apps/user-app/
COPY apps/bank-webhook/package.json ./apps/bank-webhook/
COPY packages/db/package.json ./packages/db/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/store/package.json ./packages/store/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies (including devDependencies for build phase)
RUN npm ci

# Copy full monorepo source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the Next.js application
RUN npx turbo run build --filter=user-app

# --- Production Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

# Copy node_modules and built application outputs
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package.json ./package.json
COPY --from=base /usr/src/app/apps/user-app/node_modules ./apps/user-app/node_modules
COPY --from=base /usr/src/app/apps/user-app/package.json ./apps/user-app/package.json
COPY --from=base /usr/src/app/apps/user-app/.next ./apps/user-app/.next
COPY --from=base /usr/src/app/apps/user-app/public ./apps/user-app/public
COPY --from=base /usr/src/app/packages ./packages

EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "start", "--workspace=apps/user-app"]
