module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/standard',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'standard'],
  rules: {
    'prettier/prettier': "error",
  },
  globals: {},
}
