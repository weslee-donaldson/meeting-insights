#!/usr/bin/env bash
set -euo pipefail

pid=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$pid" ]; then
  echo "Killing process on port 3000 (PID: $pid)"
  kill "$pid"
  sleep 1
fi

echo "Starting API server..."
exec pnpm api:dev
