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
  imageCover: (
    <div className="cart-item__image-cover flex flex-middle flex-center text-center text-line-height-base">
      <span className="text-uppercase">Sold Out</span>
    </div>
  ),
  summaryTag: (
    <i className="tag__small tag__primary text-size-smaller tag text-uppercase text-weight-bolder" style={style}>
      Best Seller
    </i>
  ),
  title: 'DeliveryDetails',
  variation: 'red, bigger',
  details: <div></div>,
  handleClickItem: () => {},
};
