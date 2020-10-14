// YourTheme.js

import { create } from '@storybook/theming/create';

export default create({
  base: 'light',

  colorPrimary: '#ff9419',
  colorSecondary: '#00b0ff',

  // UI
  appBg: '#ffffff',
  appContentBg: '#fbfbfb',
  appBorderColor: '#dededf',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Open Sans", Helvetica, Arial, sans-serif',
  fontCode: 'sans-serif',

  // Text colors
  textColor: '#303030',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#303030',
  barSelectedColor: '#00b0ff',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#dededf',
  inputTextColor: '#30303',
  inputBorderRadius: 4,

  brandTitle: 'StoreHub Beep',
  brandUrl: 'https://beepit.com',
  brandImage: 'https://d24lyus32iwlxh.cloudfront.net/beep/storehub-beep-logo.png',
});