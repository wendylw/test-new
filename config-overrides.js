const { override, addWebpackPlugin } = require('customize-cra');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin');

const path = require('path');
const { URL } = require('url');

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
        include: './build/static/js/',
        urlPrefix:
          'http://localhost:8080' +
          path.join(process.env.PUBLIC_URL ? new URL(process.env.PUBLIC_URL).pathname : '', 'static/js'),
      })
    )
  ),
  addWebpackPlugin(new HtmlWebpackInjectAttributesPlugin({ crossorigin: 'anonymous' }))
);

// refer to docs on https://github.com/timarney/react-app-rewired
customization.jest = require('./jest-config-overrides');

module.exports = customization;
