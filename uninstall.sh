#!/usr/bin/env bash
# ============================================================
# Meeting Insights - guided uninstall
# Removes application state (PM2 apps, pnpm global link, generated
# artifacts). Optionally removes config and/or data.
#
# Does NOT touch: PM2 itself, pnpm itself, node, the PM2 boot hook,
# or any other globally-installed tooling.
# ============================================================
set -e

cd "$(dirname "$0")"

INTERACTIVE=1
if [ ! -t 0 ] || [ "${MTI_SETUP_SKIP_PROMPTS:-0}" = "1" ]; then
  INTERACTIVE=0
fi

# confirm "question" [Y|N]
confirm() {
  local msg="$1"
  local default="${2:-Y}"
  if [ "$INTERACTIVE" = "0" ]; then
    [ "$default" = "Y" ]
    return
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

PM2_APPS=(mti-api mti-web webhook-watcher)

echo "============================================================"
echo "Meeting Insights - Uninstall"
echo "============================================================"
echo ""
echo "This will remove:"
echo "  • PM2 apps registered by this project: ${PM2_APPS[*]}"
echo "  • The 'mti' pnpm global link (pnpm itself is kept)"
echo "  • Generated build artifacts (electron-ui/out/, models/, .keys/)"
echo ""
echo "It will NOT remove:"
echo "  • PM2, pnpm, node, or any other globally-installed tool"
echo "  • The PM2 boot hook (pm2 startup) — it's system-wide"
echo "  • node_modules (run 'rm -rf node_modules' manually if desired)"
echo ""
echo "You will be asked separately about config files and data."
echo ""

if ! confirm "Proceed with uninstall?" N; then
  echo "    Cancelled."
  exit 0
fi

echo ""
echo "==> Removing PM2 apps..."
if command -v pnpm >/dev/null 2>&1 && [ -d node_modules/pm2 ]; then
  PM2="pnpm exec pm2"
elif command -v pm2 >/dev/null 2>&1; then
  PM2="pm2"
else
  PM2=""
fi

if [ -n "$PM2" ]; then
  for app in "${PM2_APPS[@]}"; do
    if $PM2 describe "$app" >/dev/null 2>&1; then
      echo "    Deleting $app..."
      $PM2 delete "$app" >/dev/null
    else
      echo "    $app not registered (skipping)."
    fi
  done
  $PM2 save >/dev/null 2>&1 || true
  echo "    PM2 dump updated."
else
  echo "    PM2 not found; skipping."
fi

echo ""
echo "==> Unlinking 'mti' CLI global..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm unlink --global 2>/dev/null || echo "    (mti was not linked globally)"
else
  echo "    pnpm not found; skipping."
fi

echo ""
echo "==> Removing generated artifacts..."
for path in electron-ui/out models .keys; do
  if [ -e "$path" ]; then
    rm -rf "$path"
    echo "    removed $path"
  fi
done

echo ""
echo "==> Config files..."
echo "    .env.local       (your API keys and port overrides)"
echo "    config/clients.json (your client definitions)"
if confirm "Remove these config files?" N; then
  [ -f .env.local ] && rm -f .env.local && echo "    removed .env.local"
  [ -f config/clients.json ] && rm -f config/clients.json && echo "    removed config/clients.json"
else
  echo "    Kept. Re-running ./setup.sh will reuse them."
fi

echo ""
echo "==> Database backup (optional)..."
if [ -d db ] && [ -n "$(ls -A db 2>/dev/null)" ]; then
  echo "    Back up db/ (SQLite + LanceDB) before any data deletion?"
  echo "    Produces a timestamped tarball in the parent directory."
  if confirm "Create backup now?" Y; then
    TS=$(date +%Y%m%d-%H%M%S)
    BACKUP="../mti-db-backup-${TS}.tar.gz"
    tar -czf "$BACKUP" db
    echo "    Backup written to $(cd .. && pwd)/mti-db-backup-${TS}.tar.gz"
  else
    echo "    Skipped."
  fi
else
  echo "    No db/ directory found; nothing to back up."
fi

echo ""
echo "==> Data directories..."
echo "    This permanently destroys:"
echo "      db/                      (SQLite databases, LanceDB vector store, backups)"
echo "      data/manual/             (manually-added transcripts)"
echo "      data/webhook/            (webhook-ingested transcripts)"
echo "      data/assets/             (extracted assets)"
echo "      data/audit/              (audit logs)"
echo "      data/eval/               (eval artifacts)"
echo "      data/clients/            (per-client scratch)"
echo "      data/krisp-gdrive/       (Google Drive sync state)"
if confirm "Delete ALL application data? (cannot be undone)" N; then
  echo ""
  echo "    ⚠  FINAL CONFIRMATION"
  echo "    You are about to permanently destroy all meetings, extractions,"
  echo "    vectors, and audit logs. This cannot be undone."
  if [ "$INTERACTIVE" = "1" ]; then
    read -r -p "    Type 'DELETE' (uppercase) to confirm: " REPLY
    if [ "$REPLY" != "DELETE" ]; then
      echo "    Confirmation not received. Data kept."
      REPLY=""
    else
      REPLY="confirmed"
    fi
  else
    REPLY="confirmed"
  fi
  if [ "$REPLY" = "confirmed" ]; then
    for path in db data/manual data/webhook data/assets data/audit data/eval data/clients data/krisp-gdrive; do
      if [ -e "$path" ]; then
        rm -rf "$path"
        echo "    removed $path"
      fi
    done
  fi
else
  echo "    Kept."
fi

echo ""
echo "============================================================"
echo "Uninstall complete."
echo ""
echo "To fully remove the checkout, delete this directory:"
echo "  rm -rf \"$(pwd)\""
echo "============================================================"
