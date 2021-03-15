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
  contentClassName: 'flex-middle',
  variation: 'red, bigger',
  tagText: 'best sell',
  operateItemDetail: () => {},
};
