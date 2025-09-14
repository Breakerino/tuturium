#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Change directory to the project root (two levels up from this script's location).
cd "$(dirname "$0")/../.."

# Clean up unused Docker build cache before build
docker builder prune -f --filter until=6h

# Build the Docker images using the local Docker Compose configuration and environment file.
if [[ "$1" == "--force" ]]; then
  docker compose build --no-cache
else
  docker compose build
fi

# Clean up unused Docker build cache after build
docker builder prune -f --filter until=6h