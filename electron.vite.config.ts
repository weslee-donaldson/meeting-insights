import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, "electron-ui/out/main"),
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/electron/main/index.ts") },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, "electron-ui/out/preload"),
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/electron/preload/index.ts") },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "electron-ui/ui"),
    build: {
      outDir: resolve(__dirname, "electron-ui/out/renderer"),
      rollupOptions: {
        input: { index: resolve(__dirname, "electron-ui/ui/index.html") },
      },
    },
    plugins: [react()],
  },
});
