import { defineConfig } from "vite";
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

export default defineConfig({
  root: resolve(__dirname, "electron-ui/ui"),
  plugins: [react(), tailwindcss(), redirectRoot],
  build: {
    outDir: resolve(__dirname, "electron-ui/out/web"),
    rollupOptions: {
      input: { index: resolve(__dirname, "electron-ui/ui/index-web.html") },
    },
  },
  server: {
    port: 5188,
  },
});
