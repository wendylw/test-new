import React from 'react';
import TopMessage from './index';

export default {
  title: 'Utils/TopMessage',
  component: TopMessage,
};

const Template = args => <TopMessage {...args} />;

export const TopMessageTemplate = Template.bind({});
TopMessageTemplate.args = {
  className: '',
  message: 'You have earned the cashback',
};
