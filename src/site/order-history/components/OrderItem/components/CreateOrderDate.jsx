/* eslint-disable react/prop-types */
import React from 'react';
import dayjs from 'dayjs';

function CreateOrderDate({ createdTime }) {
  const formatCreateTime = dayjs(createdTime).format('D MMM YY');
  return <span className="order-history__create-time text-line-height-higher">{formatCreateTime}</span>;
}

CreateOrderDate.displayName = 'CreateOrderDate';

export default CreateOrderDate;
