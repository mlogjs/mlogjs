import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      formats: ["cjs", "es", "iife", "umd"],
      entry: resolve(__dirname, "src/index.ts"),
      name: "mlogjs",
      fileName: format => `mlogjs.${format}.js`,
    },
  },
});
