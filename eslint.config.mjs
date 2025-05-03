import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,cjs,jsx,tsx}"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node }, ecmaVersion: 2021, sourceType: "module" } },
    pluginJs.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            "no-unused-vars": ["error", { vars: "all", args: "after-used", ignoreRestSiblings: false }]
        }
    }
];
