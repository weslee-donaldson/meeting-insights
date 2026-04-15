#!/usr/bin/env bash
# ============================================================
# Meeting Insights - guided setup
# Idempotent: safe to re-run.
# Set MTI_SETUP_SKIP_PROMPTS=1 to auto-accept every prompt.
# ============================================================
set -e

cd "$(dirname "$0")"

INTERACTIVE=1
if [ ! -t 0 ] || [ "${MTI_SETUP_SKIP_PROMPTS:-0}" = "1" ]; then
  INTERACTIVE=0
fi

# confirm "question" [Y|N]
# Returns 0 if user accepts (or non-interactive). Returns 1 if declined.
confirm() {
  local msg="$1"
  local default="${2:-Y}"
  if [ "$INTERACTIVE" = "0" ]; then
    return 0
  fi
  local hint="[Y/n]"
  [ "$default" = "N" ] && hint="[y/N]"
  read -r -p "    $msg $hint " REPLY
  if [ -z "$REPLY" ]; then
    [ "$default" = "Y" ]
    return
  fi
  [[ "$REPLY" =~ ^[Yy]$ ]]
}

edit_file() {
  local file="$1"
  local editor="${EDITOR:-nano}"
  echo "    Opening $file in $editor (save and close to continue)..."
  "$editor" "$file"
}

echo "==> Checking prerequisites..."

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed. Install Node.js 22+ from https://nodejs.org/"
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "ERROR: Node.js 22+ required (found v$(node -v)). Upgrade with: brew install node@22"
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "ERROR: pnpm is not installed. Install with: npm install -g pnpm"
  exit 1
fi

echo "    node $(node -v) ✓"
echo "    pnpm $(pnpm -v) ✓"

echo ""
echo "==> Installing dependencies (pnpm install)..."
echo "    Pulls all runtime and dev packages, including PM2 (process manager)."
pnpm install

echo ""
echo "==> Configuring environment (.env.local)..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "    Created .env.local from .env.example."
  echo "    You need to set ANTHROPIC_API_KEY (or another LLM provider key)"
  echo "    before the API can extract from meetings."
  if confirm "Open .env.local now to set your API key?"; then
    edit_file .env.local
  else
    echo "    Skipped. Remember to edit .env.local before starting mti-api."
  fi
else
  echo "    .env.local already exists (skipping)."
fi

echo ""
echo "==> Scaffolding data directories..."
mkdir -p \
  data/assets \
  data/audit \
  data/eval \
  data/manual/raw-transcripts \
  data/manual/processed \
  data/manual/failed \
  data/manual/external-transcripts \
  data/webhook/raw-transcripts \
  data/webhook/processed \
  data/webhook/failed \
  db
echo "    data/ and db/ scaffolded ✓"

echo ""
echo "==> Configuring clients (config/clients.json)..."
if [ ! -f config/clients.json ]; then
  cp config/clients.example.json config/clients.json
  echo "    Created config/clients.json from the example."
  echo "    Define your real clients here: team members, aliases, meeting names,"
  echo "    glossary. See docs/clients.md for the schema."
  if confirm "Open config/clients.json now?"; then
    edit_file config/clients.json
  else
    echo ""
    echo "    Skipped. Edit config/clients.json, then re-run ./setup.sh"
    echo "    to finish seeding, building, and starting services."
    exit 0
  fi
else
  echo "    config/clients.json already exists (skipping)."
fi

echo ""
echo "==> Downloading ONNX models..."
echo "    Fetches all-MiniLM-L6-v2 (~90 MB) for local embedding generation."
pnpm download-models

echo ""
echo "==> Initializing database (pnpm setup)..."
echo "    Creates SQLite + LanceDB stores and seeds clients from config/clients.json."
pnpm setup

echo ""
echo "==> Building web UI bundle (pnpm web:build)..."
echo "    Compiles the production React bundle served by mti-web on port 5188."
pnpm web:build

echo ""
echo "==> Starting PM2 services..."
echo "    Launches mti-api (3000), mti-web (5188), and webhook-watcher."
echo "    Uses 'startOrReload' so re-running this script picks up the rebuilt"
echo "    bundle and latest env without erroring on already-running processes."
pnpm exec pm2 startOrReload ecosystem.config.cjs --update-env
pnpm exec pm2 save
echo "    Process list snapshotted (pm2 save)."

echo ""
echo "==> Configuring PM2 to resurrect on reboot..."
echo "    'pm2 startup' generates a sudo command that registers PM2 with the OS"
echo "    init system so services come back after a restart."
if confirm "Configure PM2 to start on reboot?"; then
  STARTUP_CMD=$(pnpm exec pm2 startup 2>&1 | grep -E '^sudo ' | head -1 || true)
  if [ -n "$STARTUP_CMD" ]; then
    echo ""
    echo "    About to run (requires sudo):"
    echo "      $STARTUP_CMD"
    if confirm "Execute this command now?"; then
      eval "$STARTUP_CMD"
      pnpm exec pm2 save
      echo "    Boot hook installed ✓"
    else
      echo "    Skipped. Run this command manually later to enable boot resurrection:"
      echo "      $STARTUP_CMD"
    fi
  else
    echo "    PM2 reports startup is already configured (or no sudo command needed)."
  fi
else
  echo "    Skipped. Services will NOT restart after a reboot until you run"
  echo "    'pnpm exec pm2 startup' and execute the sudo command it prints."
fi

echo ""
echo "==> Linking mti CLI globally..."
echo "    Makes 'mti <command>' work from anywhere (required for Claude Code"
echo "    skills and other integrations that call 'mti' directly)."
if confirm "Run 'pnpm link --global' now?"; then
  pnpm link --global
  echo "    mti linked globally ✓"
  echo "    (ensure ~/Library/pnpm or equivalent is on your PATH)"
else
  echo "    Skipped. Use 'pnpm mti' from this directory instead."
fi

read_env() {
  local key="$1"
  local default="$2"
  local val
  val=$(grep -E "^\s*${key}\s*=" .env.local 2>/dev/null | tail -1 | sed -E "s/^\s*${key}\s*=\s*//; s/^[\"']//; s/[\"']$//")
  echo "${val:-$default}"
}

API_PORT=$(read_env API_PORT 3000)
WEB_PORT=$(read_env WEB_PORT 5188)

echo ""
echo "============================================================"
echo "Setup complete."
echo ""
echo "Services running under PM2:"
echo "  mti-api          http://localhost:${API_PORT}"
echo "  mti-web          http://localhost:${WEB_PORT}"
echo "  webhook-watcher"
echo ""
echo "Check status:   pnpm exec pm2 status"
echo "View logs:      pnpm exec pm2 logs"
echo "Verify clients: curl http://localhost:${API_PORT}/api/clients"
echo "============================================================"
