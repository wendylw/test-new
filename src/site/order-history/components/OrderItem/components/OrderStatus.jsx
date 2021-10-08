/* eslint-disable react/prop-types */
import React from 'react';

const OrderStatus = ({ status }) => (
  <span className="order-history__order-status text-line-height-higher text-weight-bolder">{status}</span>
);

OrderStatus.displayName = 'OrderStatus';

export default OrderStatus;
