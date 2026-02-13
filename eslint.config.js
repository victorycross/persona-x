import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [
      ...tseslint.configs.recommended,
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // TypeScript handles via noUnusedLocals
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
);
