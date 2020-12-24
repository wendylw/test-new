import React from 'react';
import SwitchButtonComponent from './SwitchButton';

export default {
  title: 'Common/SwitchButton',
  component: SwitchButtonComponent,
};

const Template = args => <SwitchButtonComponent {...args} />;
export const SwitchButton = Template.bind({});
SwitchButton.args = {
  checked: true,
  name: 'switchButton',
  inputId: '',
  disabled: false,
  type: 'checkbox',
};
