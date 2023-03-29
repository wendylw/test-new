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
        // craco-esbuild depends on esbuild-jest, but esbuild-jest will not be maintained after 2021.
        // esbuild-jest in yarn test:coverage, there will be some issues, such as React is not define, etc.
        // So setting skipEsbuildJest to true to use babel for jest tests. refer: https://github.com/aelbore/esbuild-jest/issues/61
        skipEsbuildJest: true, // Set to true if you want to use babel for jest tests
      },
    },
  ],
  jest: {
    configure: jestConfig => {
      // console.log(jestConfig);
      jestConfig.collectCoverageFrom.push('!src/**/*.stories.js');
      // Ignore ky UT issues: https://github.com/sindresorhus/ky/issues/170
      jestConfig.transformIgnorePatterns[0] = '[/\\\\]node_modules[/\\\\](?!ky)[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$';
      // resetMocks is true by default, which will cause the mock function to be cleared after each test.
      // Equivalent to calling jest.resetAllMocks() before each test. This will lead to any mocks having their fake implementations removed but does not restore their initial implementation. refer: https://stackoverflow.com/a/65558672
      jestConfig.resetMocks = false;

      return jestConfig;
    },
  },
};
