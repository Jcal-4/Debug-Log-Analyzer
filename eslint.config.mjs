import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,cjs}"]},
  {languageOptions: { globals: globals.browser, ecmaVersion: 2021, sourceType: "script" }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];y