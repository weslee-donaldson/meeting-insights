# Webhook ingestion

Automated transcript ingestion: Krisp webhook events flow to a Firebase Cloud Function, land in a Google Drive folder, sync to your local machine via Google Drive for Desktop, and are picked up by a background file watcher that runs them through the full pipeline.

## Pipeline

```
Krisp meeting ends
     │
     │   POST /krispWebhook (Bearer token)
     ▼
Firebase Cloud Function (webhook-transcript-handler/firebase/)
     │
     │   Google Drive API: append JSON
     ▼
Google Drive folder
     │
     │   Google Drive for Desktop sync
     ▼
data/webhook/raw-transcripts/ (local)
     │
     │   fs.watch + 30s scan fallback
     ▼
webhook-watcher (local-service/)
     │
     │   Full pipeline: parse → ingest → detect → extract → embed
     ▼
data/webhook/processed/ or data/webhook/failed/
```

The webhook watcher processes new files in parallel with manual ingestion from `data/manual/raw-transcripts/`. Meeting IDs from webhook processing feed into the dedup set, so a meeting ingested via webhook won't be re-processed if the same transcript later arrives as a manual drop.

## Firebase Cloud Function

### Location
`webhook-transcript-handler/firebase/`

### Endpoint
`krispWebhook` -- accepts POST from Krisp, authenticates via bearer token, writes the raw JSON payload to a configured Google Drive folder.

### Project
`krisp-meeting-insights` on the Firebase Blaze plan (required for outbound network calls).

### Secrets
Configured via `firebase functions:secrets:set`:

| Secret | Purpose |
|--------|---------|
| `KRISP_AUTH_TOKEN` | Bearer token Krisp sends with each webhook |
| `DRIVE_FOLDER_ID` | Google Drive folder ID for JSON drops |
| `GOOGLE_CLIENT_ID` | OAuth client ID for Drive API |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Long-lived OAuth refresh token |

### Deploy
```bash
cd webhook-transcript-handler/firebase
firebase deploy --only functions
```

### Refreshing the OAuth token
Google refresh tokens can expire if unused. To mint a new one:

```bash
node webhook-transcript-handler/firebase/get-refresh-token.js
# Follow the consent flow, copy the refresh token, then:
firebase functions:secrets:set GOOGLE_REFRESH_TOKEN
# Paste the new value when prompted
```

## Google Drive sync

JSON payloads land in your configured Drive folder. Google Drive for Desktop mirrors them to your local machine. The watcher looks at `data/webhook/raw-transcripts/`, which is typically a symlink to the Drive-synced directory:

```bash
ln -s "$HOME/Library/CloudStorage/GoogleDrive-you@example.com/My Drive/Automations/Krisp/webhook-rawtranscripts" data/webhook/raw-transcripts
```

(Set this up once per clone. On macOS with Drive for Desktop, the CloudStorage path is typical. The `mv` done during `pnpm setup` preserves the symlink if one already exists.)

## Local watcher service

### Entrypoint
`local-service/main.ts` + `local-service/watcher.ts`

### Start
```bash
pm2 start ecosystem.config.cjs                # starts both api and watcher
# Or just the watcher:
pm2 start ecosystem.config.cjs --only webhook-watcher
```

### Commands

| Command | Purpose |
|---------|---------|
| `pnpm service:start` | Start the watcher via PM2 |
| `pnpm service:stop` | Stop the watcher |
| `pnpm service:logs` | Tail watcher logs |
| `pnpm service:status` | Check PM2 status |

### Watching strategy

The watcher uses `fs.watch` with a 30-second periodic scan fallback. macOS + Google Drive sync can miss `fs.watch` events, so the periodic scan catches anything the native watcher drops. File writes are debounced to avoid processing partially-synced files.

### Alerts (optional)

Pipeline failures can notify an email address. Configure via `.env.local`:

```
MTNINSIGHTS_SMTP_HOST=smtp.example.com
MTNINSIGHTS_SMTP_PORT=587
MTNINSIGHTS_SMTP_USER=alerts@example.com
MTNINSIGHTS_SMTP_PASS=...
MTNINSIGHTS_ALERT_EMAIL=oncall@example.com
```

If SMTP is unconfigured, failures are just logged and surfaced via `GET /api/health`.

## Troubleshooting

**Files not being processed**
- `pnpm service:logs` -- check for errors
- `pnpm service:status` -- verify the watcher is running
- Confirm `data/webhook/raw-transcripts/` is the correct symlink target

**Drive sync not working**
- Google Drive for Desktop must be running and signed in
- The watched folder must be inside the synced scope (not a "view online" folder)

**OAuth token expired**
- Re-run `get-refresh-token.js` and update the `GOOGLE_REFRESH_TOKEN` secret (see above)

**Meeting arrives via both webhook and manual drop**
- Webhook IDs are deduplicated against the manifest before `pnpm process` runs. If you want to force-reprocess a specific meeting, use `pnpm purge <meetingId>` first, then `pnpm process`

**Firebase function errors**
- Check Firebase console logs: `firebase functions:log`
- Verify all 5 secrets are set: `firebase functions:secrets:list`
