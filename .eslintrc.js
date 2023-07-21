/** @type {import("eslint").ESLint.Options} */
const config = {
  parser: "@typescript-eslint/parser",
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./compiler/tsconfig.eslint.json", "./website/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "no-unused-vars": "off",
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
    "prefer-spread": "off",
  },
};

module.exports = config;
