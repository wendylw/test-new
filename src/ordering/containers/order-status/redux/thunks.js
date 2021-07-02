import { createAsyncThunk } from '@reduxjs/toolkit';
import { post } from '../../../../utils/api/api-fetch';
import Constants from '../../../../utils/constants';
import { API_INFO } from './api-info';

const { DELIVERY_METHOD } = Constants;

export const loadOrder = createAsyncThunk('ordering/orderStatus/common/fetchOrder', async orderId => {
  const result = await post(API_INFO.getOrderDetail().url, { orderId });

  if (result.data) {
    if (result.data.order && result.data.order.shippingType === 'dineIn') {
      result.data.order.shippingType = DELIVERY_METHOD.DINE_IN;
    }

    return result.data;
  }

  return result;
});
