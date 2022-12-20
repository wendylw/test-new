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

    /**
     * Allow more parallel requests to split chunks into more smaller sizes
     * Since we are using HTTP/2, modern browsers won't set parallel requests limitation
     * We will use the webpack recommendation configurations that are used in a multi-page application example
     * Refer to: https://github.com/webpack/webpack/blob/9fcaa243573005d6fdece9a3f8d89a0e8b399613/examples/many-pages/webpack.config.js#L15
     */

    // BEEP-2911: Based on our research, we can achieve the maximum chunks if the value is equal to or larger than 10
    // But we will increase the value to 20 in order to prevent future loading performance bottlenecks
    webpackConfig.optimization.splitChunks.maxAsyncRequests = 20;

    // BEEP-2911: Based on our research, we can achieve the maximum chunks if the value is equal to or larger than 2.
    // But we will increase the value to 20 in order to prevent future loading performance bottlenecks
    webpackConfig.optimization.splitChunks.maxInitialRequests = 20;

    // Define the chunk name of the chunks generated that can be used to decide what chunks should be preloaded.
    webpackConfig.optimization.splitChunks.name = true;
    return webpackConfig;
  },
};
