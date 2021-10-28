/* eslint-disable react/prop-types */
import React from 'react';

function StoreName({ storeName }) {
  return <span className="order-history__store-name text-line-height-higher text-weight-bolder">{storeName}</span>;
}

StoreName.displayName = 'StoreName';

export default StoreName;
