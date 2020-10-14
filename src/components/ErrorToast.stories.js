import React from 'react';
import ErrorToast from './ErrorToast';

export default {
  title: 'Common/ErrorToast',
  component: ErrorToast,
};

const Template = args => <ErrorToast {...args} />;

export const ErrorToastTemplate = Template.bind({});
ErrorToastTemplate.args = {
  message: 'Someone else has already earned cashback for this receipt.😅',
};
