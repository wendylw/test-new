/* eslint-disable react/prop-types */
import React from 'react';
import StoreLogo from './components/StoreLogo';
import OrderStatus from './components/OrderStatus';
import StoreName from './components/StoreName';
import OrderShippingType from './components/OrderShippingType';
import CreateOrderDate from './components/CreateOrderDate';

function OrderItem({ order }) {
  return (
    <div className="order-history__item-card padding-normal">
      <div className="flex flex-top">
        <StoreLogo storeName={order.beepBrandName} url={order.businessLogo} />
        <ul className="margin-left-right-smaller padding-left-right-smaller">
          <li>
            <OrderStatus status={order.statusText} />
          </li>
          <li>
            <StoreName storeName={order.store.storeDisplayName} />
          </li>
          <li style={{ margin: '8px 0' }}>
            <OrderShippingType shippingType={order.shippingType} />
          </li>
        </ul>
      </div>
      <div className="order-history__create-order-date-wrapper padding-normal">
        <CreateOrderDate createdTime={order.createdTime} />
      </div>
    </div>
  );
}

OrderItem.displayName = 'OrderItem';

export default OrderItem;
