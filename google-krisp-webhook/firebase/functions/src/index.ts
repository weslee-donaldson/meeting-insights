import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { google } from "googleapis";

const KRISP_AUTH_TOKEN = defineSecret("KRISP_AUTH_TOKEN");
const DRIVE_FOLDER_ID = defineSecret("DRIVE_FOLDER_ID");
const GOOGLE_CLIENT_ID = defineSecret("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");
const GOOGLE_REFRESH_TOKEN = defineSecret("GOOGLE_REFRESH_TOKEN");

function getDrive() {
  const oauth2 = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value().trim(),
    GOOGLE_CLIENT_SECRET.value().trim()
  );
  oauth2.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN.value().trim() });
  return google.drive({ version: "v3", auth: oauth2 });
}

export const krispWebhook = onRequest(
  {
    secrets: [
      KRISP_AUTH_TOKEN,
      DRIVE_FOLDER_ID,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REFRESH_TOKEN,
    ],
  },
  async (req, res) => {
    if (req.method === "GET") {
      res.json({ status: "ok" });
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ status: "error", message: "Method not allowed" });
      return;
    }

    const token = String(
      req.query.authorization ||
        req.query.Authorization ||
        req.headers.authorization ||
        ""
    ).replace(/^Bearer\s+/i, "");
    const expected = KRISP_AUTH_TOKEN.value().trim();
    if (token !== expected) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    try {
      const payload = req.body;
      const drive = getDrive();
      const folderId = DRIVE_FOLDER_ID.value().trim();
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `krisp-${ts}.json`;

      await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
        },
        media: {
          mimeType: "application/json",
          body: JSON.stringify(payload, null, 2),
        },
      });

      console.log(`Saved: ${fileName}`);
      res.json({ status: "ok", file: fileName });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
);
