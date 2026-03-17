#!/usr/bin/env bash
set -euo pipefail

pids=$(lsof -ti :8100 2>/dev/null || true)
if [ -n "$pids" ]; then
  echo "Killing processes on port 8100: $pids"
  echo "$pids" | xargs kill -9
  sleep 1
fi

echo "Starting Claude CLI API server..."
cd "$(dirname "$0")/../claudecli-api"
exec uvicorn main:app --reload --port 8100
