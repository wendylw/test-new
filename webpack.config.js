const path = require('path');
const { URL } = require('url');
const { when } = require('@craco/craco');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

// sentryPlugin uploads source map to sentry.io on build
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

/**
 * This is the production and development configuration.
 * It is based on Luke's experience with fast loads and a minimal bundle.
 * For naming conventions, please refer to: https://www.allacronyms.com/
 * To understand what every abbreviation stands for, please refer to: https://www.acronymfinder.com/
 */
module.exports = {
  plugins: [...sentryPlugin],
  configure: (webpackConfig, { env }) => {
    const isEnvDevelopment = env === 'development';
    const isEnvProduction = env === 'production';

    /**
     * Keep the final output's name short even when chunk name is specified (for js)
     * BEEP-2650: We will name chunk file in different way according to webpack env
     * Refer to: https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-scripts/config/webpack.config.js#L225
     */
    webpackConfig.output.chunkFilename = isEnvProduction
      ? 'static/js/[id].[chunkhash:8].chunk.js'
      : isEnvDevelopment && 'static/js/[id].chunk.js';

    /**
     * Keep the final output's name short even when chunk name is specified (for css)
     * Refer to: https://github.com/dilanx/craco/issues/382
     */
    webpackConfig.plugins.some(plugin => {
      // use Array.prototype.some so that we can break out of the loop
      if (plugin.constructor.name === 'MiniCssExtractPlugin') {
        plugin.options.chunkFilename = 'static/css/[id].[contenthash:8].chunk.css';
        return true;
      }
    });

    // Allow more parallel requests, since we are using HTTP/2
    // TODO: will complete & test it in BEEP-2911

    // Define the chunk name of the chunks generated that can be used to decide what chunks should be preloaded.
    webpackConfig.optimization.splitChunks.name = true;
    return webpackConfig;
  },
};
