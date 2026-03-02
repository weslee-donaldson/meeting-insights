import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/electron/main/index.ts") },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/electron/preload/index.ts") },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "electron-ui/ui"),
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/ui/index.html") },
      },
    },
    plugins: [react()],
  },
});
