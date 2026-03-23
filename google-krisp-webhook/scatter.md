# Krisp Webhook → Google Drive

Google Apps Script that receives Krisp webhook POST requests and saves meeting transcripts to Google Drive in the format expected by the krisp-meeting-insights pipeline.

## What it does

1. Receives POST from Krisp when a meeting transcript/notes/outline is generated
2. Creates a folder in Drive: `{meeting_slug}-{id}/`
3. Saves `transcript.md`, `recording_download_link.md`, and `raw_payload.json`
4. Updates `manifest.json` in the root Drive folder (same format as `data/raw-transcripts/manifest.json`)

## Drive folder

Target: `My Drive → Automations → Krisp → webhook-rawtranscripts`
https://drive.google.com/drive/u/0/folders/1kYaYMGuNphpkyz2SJF3oQeajsmf-zHn7

## Setup

1. Go to https://script.google.com and create a new project
2. Replace the contents of `Code.gs` with the file from this directory
3. Click **Deploy → New deployment**
4. Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL
6. In Krisp webhook settings, set:
   - **URL**: `<deployment-url>?authorization=<your-token>`
   - **Events**: Transcript created, Notes generated, Outline generated

### Auth note

Google Apps Script web apps cannot access custom HTTP headers from incoming requests. The auth token must be passed as a query parameter: `?authorization=abb50c99...`

## Testing

1. In the Apps Script editor, select `testWebhook` from the function dropdown
2. Click **Run**
3. Check the Drive folder for the test meeting files
4. Check `manifest.json` was created/updated

## Payload discovery

Since the exact Krisp webhook payload schema isn't publicly documented, the script:
- Logs every raw payload to `webhook_log_*.json` in the Drive folder
- Saves `raw_payload.json` inside each meeting folder
- Tries multiple common field names for each piece of data

After your first real webhook fires, check the log files and update the `extract*_()` functions in `Code.gs` to match the actual field names Krisp uses.

## Pipeline integration

The files saved to Drive match the format in `data/raw-transcripts/`:
```
webhook-rawtranscripts/
├── manifest.json
├── meeting_slug-id/
│   ├── transcript.md
│   ├── recording_download_link.md
│   └── raw_payload.json
```

To sync into the pipeline, copy/download the Drive folder contents into `data/raw-transcripts/` and run the processing pipeline. A future enhancement could automate this sync.
