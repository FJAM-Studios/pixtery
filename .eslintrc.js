module.exports = {
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "universe/native",
    "universe/shared/typescript-analysis",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    node: true,
  },
};
