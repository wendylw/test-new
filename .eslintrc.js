const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = 'scripts/eslint-rules';

// We will progressively remove files from this list
const legacyFiles = [
  'src/common/components/ReCAPTCHA/index.jsx',
  'src/site/qrscan/index.jsx',
  'src/serviceWorker.js',
  'src/setupProxy.js',
  'src/setupTests.js',
  'src/sw-build.js',
  'src/sw-template.js',
];

module.exports = {
  env: {
    browser: true,
  },
  parserOptions: {
    // keep consistent with https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'rulesdir'],
  overrides: [
    {
      files: 'src/**/*.@(js|jsx|ts|jsx)',
      excludedFiles: legacyFiles,
      extends: ['react-app', 'airbnb', 'prettier'],
      rules: {
        'no-console': [1, { allow: ['error'] }],
        'no-unused-expressions': 'off',
        'react/display-name': ['error', { ignoreTranspilerName: true }],
        'react/prop-types': [2, { ignore: ['t', 'history'] }],
        'react/button-has-type': [0],
        'import/prefer-default-export': [0],
        'no-nested-ternary': [0],
        'class-methods-use-this': [0],
        'no-debugger': 'warn',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'no-param-reassign': ['error', { ignorePropertyModificationsFor: ['state'] }],
        'no-unused-vars': 'error',
        'import/no-named-as-default-member': 'warn',
        'rulesdir/jsx-test-id': ['error', { ifExist: ['onClick', 'onChange', 'onBlur', 'onFocus'] }],
        'rulesdir/no-data-heap-name': 'error',
      },
    },
    {
      files: legacyFiles,
      extends: ['react-app', 'prettier'],
      rules: {
        'no-unused-expressions': 'off',
        'react/display-name': ['error', { ignoreTranspilerName: true }],
        'rulesdir/jsx-test-id': ['error', { ifExist: ['onClick', 'onChange', 'onBlur', 'onFocus'] }],
        'rulesdir/no-data-heap-name': 'error',
      },
    },
  ],
};
