FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY libs/core/package.json ./libs/core/
RUN yarn install

FROM node:20-alpine AS deps
WORKDIR /app
COPY --from=base /app/libs/core/package.json ./libs/core/
COPY --from=base /app/package.json /app/yarn.lock ./
RUN yarn install --production --ignore-scripts --prefer-offline --frozen-lockfile

FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GH_CLIENT_ID
COPY . .
RUN yarn build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start", "-- -p 3000"]