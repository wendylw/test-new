import React from 'react';
import { ItemComponent } from './Item';

export default {
  title: 'Common/Item',
  component: ItemComponent,
};

const Template = args => <ItemComponent {...args} />;

export const PeoductItem = Template.bind({});
PeoductItem.args = {
  className: 'flex-middle',
  title: 'DeliveryDetails',
  contentClassName: 'flex-middle',
  variation: 'red, bigger',
  tagText: 'best sell',
  operateItemDetail: () => {},
};
