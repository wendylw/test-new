import React from 'react';
import Error from './Error';

export default {
  title: 'Common/Error',
  component: Error,
};

const Template = args => <Error {...args} />;

export const UnsupportedBrowser = Template.bind({});
UnsupportedBrowser.args = {
  title: 'UnsupportedBrowser',
  description: 'Please open beepit.co in Safari.',
};
