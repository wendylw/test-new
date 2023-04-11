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
      },
    },
  ],
};
