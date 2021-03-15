import React from 'react';
import { ItemStoryComponent } from './Item';

export default {
  title: 'Common/Item',
  component: ItemStoryComponent,
};

const Template = args => <ItemStoryComponent {...args} />;

export const PeoductItem = Template.bind({});
PeoductItem.args = {
  className: 'flex-middle',
  title: 'DeliveryDetails',
  contentClassName: 'flex-middle',
  variation: 'red, bigger',
  tagText: 'best sell',
  operateItemDetail: () => {},
};
