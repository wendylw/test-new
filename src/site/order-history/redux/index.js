/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadNextOrderHistoryData, initOrderHistoryData } from './thunks';

import Constants from '../../../utils/constants';

// eslint-disable-next-line import/no-named-as-default-member
const { API_REQUEST_STATUS, DELIVERY_METHOD } = Constants;

const initialState = {
  data: {},
  status: null,
  error: null,
  page: 1,
  pageSize: 15,
  hasMore: true,
};

export const { reducer, actions } = createSlice({
  name: 'site/orderHistory',
  initialState,
  extraReducers: {
    [loadNextOrderHistoryData.pending.type]: state => {
      state.status = API_REQUEST_STATUS.PENDING;
    },
    [loadNextOrderHistoryData.fulfilled.type]: (state, action) => {
      const orderHistoryList = action.payload;
      const orderHistoryObj = {};
      let rank = Object.keys(state.data).length;

      orderHistoryList.forEach(order => {
        rank += 1;

        orderHistoryObj[order.receiptNumber] = {
          ...order,
          shippingType: order.shippingType === 'dineIn' ? DELIVERY_METHOD.DINE_IN : order.shippingType,
          rank, // position of the order in the list(attribute of Clever tap event)
        };
      });

      state.data = {
        ...state.data,
        ...orderHistoryObj,
      };
      state.status = API_REQUEST_STATUS.FULFILLED;
      state.hasMore = orderHistoryList.length >= state.pageSize;
      state.page += 1;
      state.error = null;
    },
    [loadNextOrderHistoryData.rejected.type]: (state, action) => {
      state.status = API_REQUEST_STATUS.REJECTED;
      state.error = action.error;
    },

    [initOrderHistoryData.pending.type]: state => {
      state.status = API_REQUEST_STATUS.PENDING;
    },
    [initOrderHistoryData.fulfilled.type]: (state, action) => {
      const orderHistoryList = action.payload;
      const orderHistoryObj = {};
      let rank = 0;

      orderHistoryList.forEach(order => {
        rank += 1;

        orderHistoryObj[order.receiptNumber] = {
          ...order,
          shippingType: order.shippingType === 'dineIn' ? DELIVERY_METHOD.DINE_IN : order.shippingType,
          rank, // position of the order in the list(attribute of Clever tap event)
        };
      });

      state.data = orderHistoryObj;
      state.page = 1;
      state.hasMore = orderHistoryList.length >= state.pageSize;
      state.status = API_REQUEST_STATUS.FULFILLED;
      state.error = null;
    },
    [initOrderHistoryData.rejected.type]: (state, action) => {
      state.status = API_REQUEST_STATUS.REJECTED;
      state.error = action.error;
    },
  },
});

export default reducer;
