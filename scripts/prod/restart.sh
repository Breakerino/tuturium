#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Change directory to the project root (two levels up from this script's location).
cd "$(dirname "$0")/../.."

# Restart all services defined in the local Docker Compose configuration using the specified environment file.
docker compose restart