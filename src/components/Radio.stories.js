import React from 'react';
import RadioComponent from './Radio';

export default {
  title: 'Common/Radio',
  component: RadioComponent,
};

const Template = args => <RadioComponent {...args} />;
export const Radio = Template.bind({});
Radio.args = {
  checked: true,
  name: '200ml',
  inputId: '',
  disabled: false,
};
