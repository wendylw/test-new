import React from 'react';
import { ItemOperatorComponent } from './ItemOperator';

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
