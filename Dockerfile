FROM node:20-alpine AS builder  # 안정적인 LTS 버전 사용

WORKDIR /app

ARG ENV_LOCAL_CONTENT
RUN echo "$ENV_LOCAL_CONTENT" > .env.local

COPY package.json package-lock.json ./

# Next.js가 설치되었는지 확인
RUN npm ci --legacy-peer-deps --force && ls -la node_modules/.bin

COPY . .

RUN npx next build  # `npx` 사용해서 실행 보장

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 실행 환경에서 node_modules 설치
RUN npm install --omit=dev

CMD ["npm", "run", "start"]