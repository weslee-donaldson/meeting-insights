"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.krispWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const googleapis_1 = require("googleapis");
const KRISP_AUTH_TOKEN = (0, params_1.defineSecret)("KRISP_AUTH_TOKEN");
const DRIVE_FOLDER_ID = (0, params_1.defineSecret)("DRIVE_FOLDER_ID");
const GOOGLE_CLIENT_ID = (0, params_1.defineSecret)("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = (0, params_1.defineSecret)("GOOGLE_CLIENT_SECRET");
const GOOGLE_REFRESH_TOKEN = (0, params_1.defineSecret)("GOOGLE_REFRESH_TOKEN");
function getDrive() {
    const oauth2 = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID.value().trim(), GOOGLE_CLIENT_SECRET.value().trim());
    oauth2.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN.value().trim() });
    return googleapis_1.google.drive({ version: "v3", auth: oauth2 });
}
exports.krispWebhook = (0, https_1.onRequest)({
    secrets: [
        KRISP_AUTH_TOKEN,
        DRIVE_FOLDER_ID,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN,
    ],
}, async (req, res) => {
    if (req.method === "GET") {
        res.json({ status: "ok" });
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ status: "error", message: "Method not allowed" });
        return;
    }
    const token = String(req.query.authorization ||
        req.query.Authorization ||
        req.headers.authorization ||
        "").replace(/^Bearer\s+/i, "");
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
    }
    catch (err) {
        console.error("Webhook error:", err);
        res.status(500).json({
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
        });
    }
});
//# sourceMappingURL=index.js.map