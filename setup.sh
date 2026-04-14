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

echo "==> Downloading ONNX models..."
pnpm download-models

echo "==> Initializing database..."
pnpm setup

echo ""
echo "==> mti CLI"
echo "    You can always run the CLI as 'pnpm mti <command>' from this directory."
echo "    Optionally, install it globally so 'mti' works from anywhere."
if [ -t 0 ] && [ "${MTI_SETUP_SKIP_PROMPTS:-0}" != "1" ]; then
  read -r -p "    Install mti globally via 'pnpm link --global'? [y/N] " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    pnpm link --global
    echo "    mti linked globally ✓"
    echo "    (ensure ~/Library/pnpm or equivalent is on your PATH; run 'pnpm setup' if 'mti' isn't found)"
  else
    echo "    Skipped. Use 'pnpm mti' from this directory, or re-run this script to install globally."
  fi
else
  echo "    Non-interactive shell; skipping. Run 'pnpm link --global' manually to install."
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
