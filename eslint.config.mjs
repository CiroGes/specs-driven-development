import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Generated agent adapters are projected from sdd/ (the canonical source we
    // lint); skip the generated trees to avoid linting duplicate copies.
    ignores: [
      "node_modules/**",
      "coverage/**",
      "dist/**",
      ".claude/**",
      ".agents/**",
      ".opencode/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      "no-console": "off"
    }
  }
);
