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

# Install dependencies (including devDependencies for esbuild step)
RUN npm ci

# Copy full monorepo source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the bank-webhook backend using esbuild via turbo
RUN npx turbo run build --filter=bank-webhook

# --- Production Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3003

RUN apk add --no-cache openssl

# Copy node_modules and built application outputs
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/node_modules/.prisma /usr/src/app/.prisma
COPY --from=base /usr/src/app/package.json ./package.json
COPY --from=base /usr/src/app/apps/bank-webhook/package.json ./apps/bank-webhook/package.json
COPY --from=base /usr/src/app/apps/bank-webhook/dist ./apps/bank-webhook/dist
COPY --from=base /usr/src/app/packages/db ./packages/db

EXPOSE 3003

# Command to run the application
CMD ["npm", "run", "start", "--workspace=apps/bank-webhook"]
