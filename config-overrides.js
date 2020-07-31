const { override, addWebpackPlugin } = require('customize-cra');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const withCondition = (conditionFunc, overrideFunc) => config => {
  if (conditionFunc(config)) {
    return overrideFunc(config);
  }
  return config;
};

const customization = override(
  withCondition(
    config =>
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT &&
      process.env.SENTRY_AUTH_TOKEN &&
      config.mode === 'production',
    addWebpackPlugin(
      new SentryWebpackPlugin({
        include: 'src',
        ignore: ['node_modules', 'webpack.config.js'],
        urlPrefix: '~/static/js',
      })
    )
  )
);

// refer to docs on https://github.com/timarney/react-app-rewired
customization.jest = require('./jest-config-overrides');

module.exports = customization;
