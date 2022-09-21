import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../../../utils/api/api-fetch';
import Constants from '../../../../utils/constants';
import { getReceiptNumber, getStoreRating, getStoreComment, getIsMerchantContactAllowable } from './selector';
import { API_INFO, getOrderStoreReview, postOrderStoreReview } from './api-info';

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

export const loadOrderStatus = createAsyncThunk('ordering/orderStatus/common/fetchOrderStatus', async orderId =>
  get(API_INFO.getOrderStatus(orderId).url)
);

export const loadOrderStoreReview = createAsyncThunk(
  'ordering/orderStatus/common/fetchOrderStoreReview',
  async (_, { getState }) => {
    const orderId = getReceiptNumber(getState());
    const { data } = await getOrderStoreReview(orderId);

    return data;
  }
);

export const saveOrderStoreReview = createAsyncThunk(
  'ordering/orderStatus/common/saveOrderStoreReview',
  async (_, { getState }) => {
    const state = getState();
    const orderId = getReceiptNumber(state);
    const rating = getStoreRating(state);
    const comments = getStoreComment(state);
    const allowMerchantContact = getIsMerchantContactAllowable(state);

    await postOrderStoreReview({ orderId, rating, comments, allowMerchantContact });
  }
);
