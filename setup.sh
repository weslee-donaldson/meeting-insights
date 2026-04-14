#!/usr/bin/env bash
# ============================================================
# Meeting Insights - setup script
# One-command onboarding for a fresh clone.
# Idempotent: safe to re-run.
# ============================================================
set -e

cd "$(dirname "$0")"

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

echo "==> Installing dependencies..."
pnpm install

echo "==> Configuring environment..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "    created .env.local from .env.example"
  echo ""
  echo "  ⚠  Edit .env.local and add your ANTHROPIC_API_KEY (or other provider key)"
  echo "     before running the API server."
  echo ""
else
  echo "    .env.local already exists (skipping)"
fi

echo "==> Configuring clients..."
CLIENTS_JUST_CREATED=0
if [ ! -f config/clients.json ]; then
  cp config/clients.example.json config/clients.json
  CLIENTS_JUST_CREATED=1
  echo "    created config/clients.json from config/clients.example.json"
else
  echo "    config/clients.json already exists (skipping)"
fi

echo "==> Downloading ONNX models..."
pnpm download-models

if [ "$CLIENTS_JUST_CREATED" = "1" ]; then
  echo ""
  echo "============================================================"
  echo "⚠  Stopping before database seed."
  echo ""
  echo "   config/clients.json was just created from the example."
  echo "   Edit it to define your real clients before seeding:"
  echo "     - team members, aliases, meeting names, glossary"
  echo "     - see docs/clients.md for the schema"
  echo ""
  echo "   Also edit .env.local and set ANTHROPIC_API_KEY."
  echo ""
  echo "   Then finish setup with:"
  echo "     pnpm setup                        # seeds clients"
  echo "     pm2 start ecosystem.config.cjs    # starts services"
  echo ""
  echo "   Verify with:  curl http://localhost:3000/api/clients"
  echo "============================================================"
  exit 0
fi

echo "==> Initializing database..."
pnpm setup

echo ""
echo "==> mti CLI"
echo "    Installing mti globally so 'mti <command>' works from anywhere."
echo "    (Required for Claude Code skills and other integrations that call 'mti' directly.)"
if [ -t 0 ] && [ "${MTI_SETUP_SKIP_PROMPTS:-0}" != "1" ]; then
  read -r -p "    Run 'pnpm link --global' now? [Y/n] " REPLY
  if [[ "$REPLY" =~ ^[Nn]$ ]]; then
    echo "    Skipped. Use 'pnpm mti' from this directory, or run 'pnpm link --global' later."
  else
    pnpm link --global
    echo "    mti linked globally ✓"
    echo "    (ensure ~/Library/pnpm or equivalent is on your PATH; run 'pnpm setup' if 'mti' isn't found)"
  fi
else
  echo "    Non-interactive shell; running pnpm link --global automatically."
  pnpm link --global
fi

echo ""
echo "============================================================"
echo "Setup complete."
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and set ANTHROPIC_API_KEY (if not already)"
echo "  2. Start the API server:   pm2 start ecosystem.config.cjs"
echo "  3. Launch the web UI:      pnpm web:dev"
echo "  4. Or launch Electron:     pnpm ui:dev"
echo "============================================================"
