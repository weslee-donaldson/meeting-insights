#!/usr/bin/env bash
set -euo pipefail

pids=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$pids" ]; then
  echo "Killing processes on port 3000: $pids"
  echo "$pids" | xargs kill -9
  sleep 1
fi

echo "Starting API server..."
export DEBUG="mtninsights:*"
exec pnpm api:dev
