const { when } = require('@craco/craco');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const CracoEsbuildPlugin = require('craco-esbuild');
const path = require('path');
const { URL } = require('url');

const sentryPlugin = when(
  process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.NODE_ENV === 'production',

  () => [
    new SentryWebpackPlugin({
      include: './build/static/js/',
      urlPrefix:
        'http://localhost:8080' +
        path.join(process.env.PUBLIC_URL ? new URL(process.env.PUBLIC_URL).pathname : '', 'static/js'),
    }),
  ],
  []
);

module.exports = {
  webpack: {
    plugins: [...sentryPlugin],
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
    },
  ],
};
