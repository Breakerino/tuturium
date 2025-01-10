#!/bin/sh
set -e

echo "🚀 Building Vite app..."
yarn build

echo "✅ Starting Vite preview..."
exec yarn preview --host 0.0.0.0 --port ${APP_SERVER_PORT}