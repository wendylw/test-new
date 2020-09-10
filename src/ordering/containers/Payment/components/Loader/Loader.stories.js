import React from 'react';
import Loader from './index';

export default {
  title: 'Utils/Loader',
  component: Loader,
};

const Template = args => <Loader {...args} />;

export const LoaderTemplate = Template.bind({});
LoaderTemplate.args = {
  loaded: true,
};
