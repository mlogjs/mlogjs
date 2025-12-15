// @ts-check
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  {
    files: [
      "compiler/src/**/*.ts",
      "compiler/tests/**/*.ts",
      "website/src/**/*.ts",
    ],
    plugins: { js, ts },
    extends: ["js/recommended", "ts/recommendedTypeChecked"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "prefer-const": ["error", { destructuring: "all" }],
      "prefer-spread": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: [
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
      "**/*.d.ts",
      "compiler/test",
      "jest.config.ts",
    ],
  },
);
