#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Determine the absolute path to the project root directory (two levels up from this script's location).
PROJECT_ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# Start all services defined in the development Docker Compose configuration in detached mode.
docker compose --file docker-compose.development.yml --env-file .env.development up -d

# Check if the .env.development file exists; exit with error if not found.
if [ ! -f .env.development ]; then
  echo "Error: env.development file does not exist." >&2
  exit 1
fi

# Change directory to the API package.
cd $PROJECT_ROOT_DIR/packages/api

# Export all variables from the .env.development file to the environment.
set -a
source $PROJECT_ROOT_DIR/.env.development
set +a

# Install dependencies, build the project, and start the development server.
yarn install

# Build admin
yarn build