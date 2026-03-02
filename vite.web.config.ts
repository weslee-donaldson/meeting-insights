import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "electron-ui/ui"),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve(__dirname, "electron-ui/out/web"),
    rollupOptions: {
      input: { index: resolve(__dirname, "electron-ui/ui/index-web.html") },
    },
  },
  server: {
    port: 5173,
  },
});
