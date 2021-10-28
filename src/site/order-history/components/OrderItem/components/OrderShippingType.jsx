/* eslint-disable react/prop-types */
import React from 'react';
import Tag from '../../../../../components/Tag';
import { ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING } from '../../../../../utils/constants';

function OrderShippingType({ shippingType }) {
  return (
    <Tag
      className="order-history__shipping-type tag tag__small tag__primary text-weight-bolder"
      text={ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING[shippingType]}
    />
  );
}

OrderShippingType.displayName = 'OrderShippingType';

export default OrderShippingType;
