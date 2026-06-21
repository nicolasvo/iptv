# Tiny, dependency-free Node server — no build step, no npm install.
FROM node:22-alpine

WORKDIR /app
COPY server.js channels.m3u countries.json ./
COPY public ./public

ENV PORT=8765
EXPOSE 8765

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8765/healthz || exit 1

USER node
CMD ["node", "server.js"]
