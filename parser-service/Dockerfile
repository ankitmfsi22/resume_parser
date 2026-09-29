FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY api-server/package.json api-server/
COPY parser-service/package.json parser-service/
COPY ocr-service/package.json ocr-service/
COPY insights-worker/package.json insights-worker/

RUN npm ci

COPY packages/shared packages/shared
COPY parser-service parser-service

RUN npm run build -w @resume-parser/shared \
 && npm run build -w parser-service \
 && npm prune --omit=dev

FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/packages/shared/package.json packages/shared/package.json
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/parser-service/package.json parser-service/package.json
COPY --from=builder /app/parser-service/dist parser-service/dist

WORKDIR /app/parser-service
CMD ["node", "dist/index.js"]