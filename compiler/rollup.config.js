import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";

import pkg from "./package.json";

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
        dir: "build/cjs",
        format: "cjs",
        preserveModules: true,
        entryFileNames: "[name].cjs",
      },
      {
        dir: "build/mjs",
        format: "esm",
        preserveModules: true,
        entryFileNames: "[name].mjs",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.base.json",
      }),
    ],
  },
  {
    input: "src/bin.ts",
    output: {
      dir: "build",
      preserveModules: true,
      format: "cjs",
      entryFileNames: "[name].cjs",
      banner: "#!/usr/bin/env node",
    },
    external: /.+(?<!\.)/, // ignore everything that isn't a relative module
    plugins: [
      alias({
        entries: [
          {
            find: /^\.$/, // this replacement only works for the "." import
            replacement: "./cjs/index.cjs",
          },
        ],
      }),
      typescript({
        tsconfig: "./tsconfig.base.json",
        compilerOptions: {
          outDir: "build/types",
          declaration: true,
        },
      }),
    ],
  },
]);
