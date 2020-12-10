import React from 'react';
import PaymentLoader from './index';

export default {
  title: 'Utils/PaymentLoader',
  component: PaymentLoader,
};

const Template = args => <PaymentLoader {...args} />;

export const LoaderTemplate = Template.bind({});
LoaderTemplate.args = {
  loaded: false,
  className: '',
};
