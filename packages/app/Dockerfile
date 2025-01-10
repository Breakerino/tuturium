FROM node:18-alpine

WORKDIR /app

COPY ./package.json ./yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY ./ ./

ARG APP_SERVER_PORT=3000
EXPOSE ${APP_SERVER_PORT}

ENV APP_SERVER_NAME=""
ENV APP_SERVER_PORT=${APP_SERVER_PORT}
ENV API_BASE_URL=""

COPY ./.docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]