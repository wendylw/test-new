import { addParameters } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import '../src/Common.scss';

/**
 * viewports values in https://github.com/storybookjs/storybook/blob/master/addons/viewport/src/defaults.ts
 */
addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS, // newViewports would be an ViewportMap. (see below for examples)
    // defaultViewport: 'iphone6',
  },
});
