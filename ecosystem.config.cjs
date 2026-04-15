const fs = require("node:fs");
const path = require("node:path");

function readEnvFile(file) {
  const out = {};
  try {
    const text = fs.readFileSync(path.resolve(__dirname, file), "utf-8");
    for (const line of text.split("\n")) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}

const envFile = readEnvFile(".env.local");
const WEB_PORT = process.env.WEB_PORT ?? envFile.WEB_PORT ?? "5188";

module.exports = {
  apps: [
    {
      name: "mti-api",
      script: "api/main.ts",
      interpreter: "./node_modules/.bin/tsx",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        DEBUG: "mtninsights:*"
      }
    },
    {
      name: "mti-web",
      script: "node_modules/vite/bin/vite.js",
      args: `preview --config vite.web.config.ts --port ${WEB_PORT} --host`,
      interpreter: "node",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "webhook-watcher",
      script: "local-service/main.ts",
      interpreter: "./node_modules/.bin/tsx",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        DEBUG: "mtninsights:*"
      }
    }
  ]
};
