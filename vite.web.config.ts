import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const redirectRoot = {
  name: "redirect-root",
  configureServer(server: { middlewares: { use: (fn: (req: { method?: string; url?: string }, _res: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((req, _res, next) => {
      if (req.method === "GET" && req.url === "/") {
        req.url = "/index-web.html";
      }
      next();
    });
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname), "");
  const apiPort = Number(env.API_PORT ?? 3000);
  const webPort = Number(env.WEB_PORT ?? 5188);
  const apiBase = env.VITE_API_BASE ?? `http://localhost:${apiPort}`;
  return {
    root: resolve(__dirname, "electron-ui/ui"),
    envDir: resolve(__dirname),
    plugins: [react(), tailwindcss(), redirectRoot],
    define: {
      "import.meta.env.VITE_API_BASE": JSON.stringify(apiBase),
    },
    build: {
      outDir: resolve(__dirname, "electron-ui/out/web"),
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/ui/index-web.html") },
      },
    },
    server: {
      port: webPort,
    },
  };
});
