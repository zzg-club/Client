FROM node:18-alpine AS builder  # 안정적인 LTS 버전 사용

WORKDIR /app

ARG ENV_LOCAL_CONTENT
RUN echo "$ENV_LOCAL_CONTENT" > .env.local

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "run", "start"]