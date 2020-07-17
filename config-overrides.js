const { override, addWebpackPlugin } = require('customize-cra');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const customization = override(
  addWebpackPlugin(
    new SentryWebpackPlugin({
      include: '.',
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.config.js'],
      configFile: 'sentry.properties',
    })
  )
);

// refer to docs on https://github.com/timarney/react-app-rewired
customization.jest = require('./jest-config-overrides');

module.exports = customization;
