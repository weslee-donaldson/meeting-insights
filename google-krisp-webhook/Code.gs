// ============================================================
// Krisp Webhook → Google Drive (raw transcript pipeline format)
// ============================================================
// Deploy as: Google Apps Script Web App
//   Execute as: Me
//   Who has access: Anyone
//
// Configure KRISP_AUTH_TOKEN in Krisp webhook settings as a
// custom header:  Authorization: <token>
//
// Target Drive folder (webhook-rawtranscripts):
//   https://drive.google.com/drive/u/0/folders/1kYaYMGuNphpkyz2SJF3oQeajsmf-zHn7
// ============================================================

const KRISP_AUTH_TOKEN = "4aea147914c06a17d3407e8c4f4c080f9794a6054e9ac9a49de6f03c604a7042";
const TARGET_FOLDER_ID = "1kYaYMGuNphpkyz2SJF3oQeajsmf-zHn7";

function doPost(e) {
  try {
    if (!validateAuth_(e)) {
      return jsonResponse_({ status: "error", message: "Unauthorized" }, 401);
    }

    const payload = JSON.parse(e.postData.contents);
    logPayload_("incoming", payload);

    const meetingId = generateMeetingId_();
    const title = extractTitle_(payload);
    const date = extractDate_(payload);
    const slug = buildSlug_(title, meetingId);

    const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    const meetingFolder = folder.createFolder(slug);

    const transcriptContent = buildTranscriptMd_(title, date, payload);
    meetingFolder.createFile("transcript.md", transcriptContent, MimeType.PLAIN_TEXT);

    const recordingContent = buildRecordingLinkMd_(title, date, payload);
    meetingFolder.createFile("recording_download_link.md", recordingContent, MimeType.PLAIN_TEXT);

    meetingFolder.createFile("raw_payload.json", JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);

    updateManifest_(folder, meetingId, title, date, slug);

    Logger.log("Saved meeting: " + slug);

    return jsonResponse_({
      status: "success",
      meeting_id: meetingId,
      folder: slug
    });

  } catch (err) {
    Logger.log("Webhook error: " + err.message + "\n" + err.stack);
    return jsonResponse_({ status: "error", message: err.message }, 500);
  }
}

function doGet(e) {
  return jsonResponse_({ status: "ok", message: "Krisp webhook endpoint active" });
}

// ── Auth ──────────────────────────────────────────────────────

function validateAuth_(e) {
  const token = (e.parameter && e.parameter.authorization)
    || (e.parameter && e.parameter.Authorization)
    || "";
  if (token === KRISP_AUTH_TOKEN) return true;

  // Also check postData for token in headers (Apps Script limitation:
  // custom headers aren't directly accessible, so Krisp should send
  // the token as a query parameter: ?authorization=<token>)
  return false;
}

// ── ID Generation ─────────────────────────────────────────────

function generateMeetingId_() {
  // ULID-like: timestamp hex (12 chars) + random hex (20 chars)
  var ts = Date.now().toString(16).padStart(12, "0");
  var rand = "";
  for (var i = 0; i < 20; i++) {
    rand += Math.floor(Math.random() * 16).toString(16);
  }
  return ts + rand;
}

// ── Payload Extraction ────────────────────────────────────────
// Krisp webhook fields are discovered empirically.
// These helpers try known field names and fall back gracefully.

function extractTitle_(payload) {
  return payload.meeting_title
    || payload.title
    || payload.meetingTitle
    || payload.name
    || payload.meeting_name
    || "Untitled Meeting";
}

function extractDate_(payload) {
  var raw = payload.meeting_date
    || payload.date
    || payload.meetingDate
    || payload.created_at
    || payload.timestamp;
  if (raw) {
    try { return new Date(raw).toISOString(); } catch (_) {}
  }
  return new Date().toISOString();
}

function extractTranscript_(payload) {
  return payload.transcript
    || payload.transcription
    || payload.meeting_transcript
    || payload.content
    || "";
}

function extractRecordingUrl_(payload) {
  return payload.recording_url
    || payload.recording_link
    || payload.recordingUrl
    || payload.recording
    || payload.audio_url
    || "";
}

function extractNotes_(payload) {
  return payload.notes
    || payload.summary
    || payload.meeting_notes
    || payload.key_points
    || "";
}

function extractActionItems_(payload) {
  return payload.action_items
    || payload.actionItems
    || payload.tasks
    || [];
}

function extractOutline_(payload) {
  return payload.outline
    || payload.meeting_outline
    || "";
}

// ── File Builders ─────────────────────────────────────────────

function buildTranscriptMd_(title, date, payload) {
  var dateLabel = formatDateLabel_(date);
  var lines = ["# " + title + " - " + dateLabel, ""];

  var transcript = extractTranscript_(payload);
  if (transcript) {
    lines.push("# Transcript");
    lines.push(transcript);
    lines.push("");
  }

  var notes = extractNotes_(payload);
  if (notes) {
    lines.push("# Notes");
    if (typeof notes === "object") {
      lines.push(JSON.stringify(notes, null, 2));
    } else {
      lines.push(notes);
    }
    lines.push("");
  }

  var actionItems = extractActionItems_(payload);
  if (actionItems && actionItems.length > 0) {
    lines.push("# Action Items");
    if (Array.isArray(actionItems)) {
      actionItems.forEach(function(item) {
        var text = (typeof item === "string") ? item : (item.text || item.description || JSON.stringify(item));
        lines.push("- " + text);
      });
    } else {
      lines.push(String(actionItems));
    }
    lines.push("");
  }

  var outline = extractOutline_(payload);
  if (outline) {
    lines.push("# Outline");
    if (typeof outline === "object") {
      lines.push(JSON.stringify(outline, null, 2));
    } else {
      lines.push(outline);
    }
    lines.push("");
  }

  // If no structured data was found, dump full payload as fallback
  if (!transcript && !notes && !outline) {
    lines.push("# Raw Payload (no recognized transcript fields)");
    lines.push("```json");
    lines.push(JSON.stringify(payload, null, 2));
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

function buildRecordingLinkMd_(title, date, payload) {
  var dateLabel = formatDateLabel_(date);
  var lines = ["# " + title + " - " + dateLabel, ""];

  var url = extractRecordingUrl_(payload);
  if (url) {
    lines.push("Please click the link to download the recording. If it does not work, please copy the link and open it in your browser.");
    lines.push("");
    lines.push("# Recording Download Link");
    lines.push("");
    lines.push("**File:** recording.mp3");
    lines.push("**Valid for:** 7 days");
    lines.push("");
    lines.push("[Download Recording](<" + url + ">)");
  } else {
    lines.push("# Recording Download Link");
    lines.push("");
    lines.push("No recording URL provided in webhook payload.");
  }

  return lines.join("\n");
}

// ── Manifest ──────────────────────────────────────────────────

function updateManifest_(folder, meetingId, title, date, slug) {
  var manifest = [];
  var existingFile = null;

  var files = folder.getFilesByName("manifest.json");
  if (files.hasNext()) {
    existingFile = files.next();
    try {
      manifest = JSON.parse(existingFile.getBlob().getDataAsString());
    } catch (_) {
      manifest = [];
    }
  }

  manifest.unshift({
    meeting_id: meetingId,
    meeting_title: title,
    meeting_date: date,
    meeting_files: [
      slug + "/transcript.md",
      slug + "/recording_download_link.md"
    ]
  });

  var content = JSON.stringify(manifest, null, 2);
  if (existingFile) {
    existingFile.setContent(content);
  } else {
    folder.createFile("manifest.json", content, MimeType.PLAIN_TEXT);
  }
}

// ── Helpers ───────────────────────────────────────────────────

function buildSlug_(title, id) {
  var slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s,_-]/g, "")
    .replace(/[\s]+/g, "_")
    .replace(/[:/]/g, "_")
    .substring(0, 60)
    .replace(/_+$/g, "");
  return slug + "-" + id;
}

function formatDateLabel_(isoDate) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var d = new Date(isoDate);
  return months[d.getMonth()] + ", " + String(d.getDate()).padStart(2, "0");
}

function jsonResponse_(obj, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function logPayload_(label, payload) {
  var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  var logName = "webhook_log_" + Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd_HH-mm-ss") + ".json";
  var logData = {
    label: label,
    received_at: new Date().toISOString(),
    payload: payload
  };
  folder.createFile(logName, JSON.stringify(logData, null, 2), MimeType.PLAIN_TEXT);
}

// ── Manual Test ───────────────────────────────────────────────
// Run this from the Apps Script editor to verify Drive access

function testWebhook() {
  var mockEvent = {
    parameter: { authorization: KRISP_AUTH_TOKEN },
    postData: {
      contents: JSON.stringify({
        meeting_title: "Test Meeting from Script Editor",
        meeting_date: new Date().toISOString(),
        transcript: "**Wesley Donaldson | 00:05**\nHello, this is a test transcript.\n\n**Speaker 2 | 00:10**\nLooks good, the webhook is working!",
        notes: "This was a test meeting to verify the webhook pipeline.",
        action_items: ["Verify files appear in Drive folder", "Check manifest.json is updated"],
        recording_url: "https://example.com/recording.mp3"
      })
    }
  };

  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}
