import React from 'react';
import { ItemOperatorComponent } from './ItemOperator';
import { IconDelete, IconEdit, IconLeftArrow, IconLocation } from './Icons';
import DeliverToBar from './DeliverToBar';
import PropTypes from 'prop-types';

export default {
  title: 'Common/ItemOperator',
  component: ItemOperatorComponent,
};

const Template = args => (
  <div style={{ position: 'relative', height: '100px' }}>
    <ItemOperatorComponent {...args} />
  </div>
);

export const ItemOperator = Template.bind({});
ItemOperator.args = {
  className: 'flex-middle',
  quantity: 1,
  decreaseDisabled: false,
  onDecrease: () => {},
  onIncrease: () => {},
  increaseDisabled: false,
};
