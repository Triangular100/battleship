module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier', 'jest'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/webpack.*.js'],
      },
    ],
  },
};
