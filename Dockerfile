# syntax=docker/dockerfile:1

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# bcrypt has a native addon; build toolchain needed for alpine (musl) rebuilds
RUN apk add --no-cache python3 make g++

# copy manifests + scripts first (postinstall script patches node_modules and
# must exist before `npm ci` runs its postinstall hook)
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN npm run build

# drop devDependencies now that the build is done
RUN npm prune --omit=dev

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
# the app resolves some assets (fonts/images used in PDF generation) with
# paths relative to process.cwd(), e.g. "src/app/request/pdf/*.ttf" — keep
# src/ alongside dist/ in the runtime image so those lookups keep working
COPY --from=builder --chown=node:node /app/src ./src

USER node
EXPOSE 3000

CMD ["node", "dist/main"]
