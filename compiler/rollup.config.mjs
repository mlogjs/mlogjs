import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json" assert { type: "json" };

const dev = !!process.env.DEV;

const external = [
  ...Object.keys(pkg.dependencies),
  "node:fs",
  "node:path",
  "yargs/helpers",
];

export default defineConfig({
  input: {
    index: "src/index.ts",
    bin: "src/bin/index.ts",
  },
  external,
  output: [
    {
      dir: "dist",
      entryFileNames: "[name].mjs",
      format: "esm",
      sourcemap: dev,
    },
    {
      dir: "dist",
      entryFileNames: "[name].cjs",
      format: "cjs",
      sourcemap: dev,
      banner(chunk) {
        if (chunk.name !== "bin") return "";
        return "#!/usr/bin/env node";
      },
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        outDir: "./dist",
        declaration: true,
        sourceMap: dev,
      },
    }),
  ],
});
