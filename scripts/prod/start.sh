#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Change directory to the project root (two levels up from this script's location).
cd "$(dirname "$0")/../.."

# Build the Strapi admin
if [[ "$1" == "--force" ]]; then
  docker compose run --rm api yarn build
elif ! docker compose run --rm api test -d /srv/app/dist/build; then
  docker compose run --rm api yarn build
fi

# Start all services defined in the local Docker Compose configuration in detached mode.
docker compose --file docker-compose.yml --env-file .env up -d