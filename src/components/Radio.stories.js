import React from 'react';
import Radio from './Radio';
import { IconDelete, IconEdit, IconLeftArrow, IconLocation } from './Icons';
import DeliverToBar from './DeliverToBar';
import PropTypes from 'prop-types';

export default {
  title: 'Common/Radio',
  component: Radio,
};

const Template = args => <Radio {...args} />;
export const RadioC = Template.bind({});
RadioC.args = {
  checked: true,
  name: '200ml',
  inputId: '',
  disabled: false,
};
