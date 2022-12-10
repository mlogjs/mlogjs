import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";

import pkg from "./package.json" assert { type: "json" };

const dev = !!process.env.DEV;

const external = [
  ...Object.keys(pkg.dependencies),
  "fs",
  "yargs/helpers",
  "chalk",
  "path",
];

export default defineConfig([
  {
    input: "src/index.ts",
    external,
    output: [
      {
        file: "dist/index.cjs",
        format: "cjs",
        sourcemap: dev,
      },
      {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: dev,
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
  },
  {
    input: "src/bin.ts",
    output: {
      dir: "dist",
      preserveModules: true,
      format: "cjs",
      entryFileNames: "[name].cjs",
      banner: "#!/usr/bin/env node",
      sourcemap: dev,
    },
    external: /.+(?<!\.)/, // ignore everything that isn't a relative module
    plugins: [
      alias({
        entries: [
          {
            find: /^\.$/, // this replacement only works for the "." import
            replacement: "./index.cjs",
          },
        ],
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: dev,
      }),
    ],
  },
]);
