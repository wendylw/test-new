import React from 'react';
import ItemOperator from './ItemOperator';
import { IconDelete, IconEdit, IconLeftArrow, IconLocation } from './Icons';
import DeliverToBar from './DeliverToBar';
import PropTypes from 'prop-types';

export default {
  title: 'Common/ItemOperator',
  component: ItemOperator,
};

const Template = args => <ItemComponent {...args} />;

export const ItemOperator = Template.bind({});
ItemOperator.args = {
  className: '',
  decreaseDisabled: PropTypes.bool,
  increaseDisabled: PropTypes.bool,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  quantity: PropTypes.number,
};
