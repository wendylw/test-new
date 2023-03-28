const CracoEsbuildPlugin = require('craco-esbuild');
const WebpackConfigure = require('./webpack.config');

module.exports = {
  webpack: WebpackConfigure,
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  plugins: [
    {
      plugin: CracoEsbuildPlugin, // Use esbuild to achieve a faster build
      options: {
        esbuildMinimizerOptions: {
          target: 'es2015',
          css: false, // if true, OptimizeCssAssetsWebpackPlugin will also be replaced by esbuild.
        },
        skipEsbuildJest: true, // Set to true if you want to use babel for jest tests
      },
    },
  ],
  jest: {
    configure: jestConfig => {
      // console.log(jestConfig);
      jestConfig.collectCoverageFrom[2] = '!src/**/*.stories.js';
      jestConfig.transformIgnorePatterns[0] = '[/\\\\]node_modules[/\\\\](?!ky)[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$';
      jestConfig.resetMocks = false;

      return jestConfig;
    },
  },
};
