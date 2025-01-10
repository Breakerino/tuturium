# --------------------------------------------------
# Dependencies
# --------------------------------------------------
FROM node:18-alpine3.18 as deps

# Set up working directory
WORKDIR /srv/app

# Install libc6
RUN apk update \
 && apk upgrade \
 && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
 #&& apk add --no-cache libc6-compat git openssh
 
# Arguments
ARG NETWORK_TIMEOUT=60000

# Environment variables
ENV PATH /opt/node_modules/.bin:$PATH

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Set network timeout
RUN yarn config set network-timeout ${NETWORK_TIMEOUT} -g

# Install dependencies
RUN --mount=type=cache,id=yarn,sharing=locked,target=/usr/local/share/.cache/yarn yarn install --frozen-lockfile --arch=arm64 --platform=linuxmusl

# --------------------------------------------------
# Builder
# --------------------------------------------------
FROM node:18-alpine3.18 as builder

# Set up working directory
WORKDIR /srv/app

# Copy node_modules and package.json to the working directory
COPY --from=deps /srv/app . 

RUN mkdir -p /var/local/strapi

# Copy project files
COPY favicon.png ./favicon.png
COPY src/ src/
COPY config/ config/

# Build admin panel
#RUN yarn build 

# --------------------------------------------------
# Runner
# --------------------------------------------------
FROM node:18-alpine3.18 as runner

# Set up working directory
WORKDIR /srv/app

# Copy source files
COPY --from=builder /srv/app .

RUN mkdir -p /var/local/strapi

RUN mkdir -p ./public/uploads

# --------------------------------------------------
# Production runner
# --------------------------------------------------
FROM node:18-alpine3.18 as runner-prod

# Install rsync
RUN apk update \
 && apk upgrade \
 && apk add --no-cache rsync git openssh

# Set up working directory
WORKDIR /srv/app

# Environment variables
ENV NODE_ENV=production
ENV STRAPI_DISABLE_UPDATE_NOTIFICATION=true
ENV BROWSER=false
ENV PATH /opt/node_modules/.bin:$PATH

# Copy source files
COPY --from=runner /srv/app .

RUN mkdir -p /var/local/strapi

# Expose port
EXPOSE ${PORT}

# Start server
CMD ["yarn", "start"]

# --------------------------------------------------
# Development runner
# --------------------------------------------------
FROM node:18-alpine3.18 as runner-dev

# Install rsync
RUN apk update \
 && apk upgrade \
 && apk add --no-cache rsync git openssh

# Set up working directory
WORKDIR /srv/app

# Environment variables
ENV NODE_ENV=development
ENV PATH /opt/node_modules/.bin:$PATH

# Copy source files
COPY --from=runner /srv/app .

RUN mkdir -p /var/local/strapi

# Expose port
EXPOSE ${PORT}

# Start server
CMD ["yarn", "develop"]