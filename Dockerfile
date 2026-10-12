FROM node:24.11.1-bookworm-slim
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node demo-files ./demo-files
RUN mkdir /data && chown node:node /data
USER node
ENV DATA_DIR=/data HOST=0.0.0.0 PORT=4173 DEMO_PUBLIC=true APP_ORIGIN=http://127.0.0.1:4173
EXPOSE 4173
CMD ["node","src/server.cjs"]
