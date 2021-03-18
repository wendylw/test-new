import React from 'react';
import { ItemStoryComponent } from './Item';

export default {
  title: 'Ordering/Item',
  component: ItemStoryComponent,
};

const Template = args => <ItemStoryComponent {...args} />;

export const Item = Template.bind({});
Item.args = {
  className: 'flex-middle',
  title: 'DeliveryDetails',
  variation: 'red, bigger',
  tagText: 'best sell',
  operateItemDetail: () => {},
};
