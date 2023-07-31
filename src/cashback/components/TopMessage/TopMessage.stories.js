import React from 'react';
import TopMessage from './index';

export default {
  title: 'Utils/TopMessage',
  component: TopMessage,
};

// eslint-disable-next-line react/display-name, react/jsx-filename-extension, react/jsx-props-no-spreading
const Template = args => <TopMessage {...args} />;

export const TopMessageTemplate = Template.bind({});
TopMessageTemplate.args = {
  className: 'primary',
  message: 'You have earned the cashback',
};
