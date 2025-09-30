import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs["recommended-latest"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["*.config.{ts,js,mjs}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // No type checking for config files
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
  },
]);
