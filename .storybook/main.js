module.exports = {
  stories: ['../src/**/*.stories.@(js|mdx)'],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      enforce: 'pre',
      exclude: /node_modules/,
      loader: 'eslint-loader'
    });
    return config;
  },
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    '@storybook/addon-viewport/register',

    // docs reference:
    // https://github.com/storybookjs/storybook/blob/master/addons/docs/docs/docspage.md
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        babelOptions: {},
        sourceLoaderOptions: null,
      },
    },
  ],
};
