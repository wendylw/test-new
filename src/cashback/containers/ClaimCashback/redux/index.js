import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { fetchOrderReceiptNumber, fetchOrderCashbackInfo, createClaimedCashbackForCustomer } from './thunks';

const initialState = {
  loadOrderReceiptNumberRequest: {
    data: null,
    status: null,
    error: null,
  },
  loadOrderCashbackInfoRequest: {
    data: null,
    status: null,
    error: null,
  },
  claimedCashbackForCustomerRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'cashback/claimCashback',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchOrderReceiptNumber.pending.type]: state => {
      state.loadOrderReceiptNumberRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadOrderReceiptNumberRequest.error = null;
    },
    [fetchOrderReceiptNumber.fulfilled.type]: (state, { payload }) => {
      state.loadOrderReceiptNumberRequest.data = payload;
      state.loadOrderReceiptNumberRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadOrderReceiptNumberRequest.error = null;
    },
    [fetchOrderReceiptNumber.rejected.type]: (state, { error }) => {
      state.loadOrderReceiptNumberRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadOrderReceiptNumberRequest.error = error;
    },
    [fetchOrderCashbackInfo.pending.type]: state => {
      state.loadOrderCashbackInfoRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadOrderCashbackInfoRequest.error = null;
    },
    [fetchOrderCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.loadOrderCashbackInfoRequest.data = payload;
      state.loadOrderCashbackInfoRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadOrderCashbackInfoRequest.error = null;
    },
    [fetchOrderCashbackInfo.rejected.type]: (state, { error }) => {
      state.loadOrderCashbackInfoRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadOrderCashbackInfoRequest.error = error;
    },
    [createClaimedCashbackForCustomer.pending.type]: state => {
      state.claimedCashbackForCustomerRequest.status = API_REQUEST_STATUS.PENDING;
      state.claimedCashbackForCustomerRequest.error = null;
    },
    [createClaimedCashbackForCustomer.fulfilled.type]: (state, { payload }) => {
      state.claimedCashbackForCustomerRequest.data = payload;
      state.claimedCashbackForCustomerRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.claimedCashbackForCustomerRequest.error = null;
    },
    [createClaimedCashbackForCustomer.rejected.type]: (state, { error }) => {
      state.claimedCashbackForCustomerRequest.status = API_REQUEST_STATUS.REJECTED;
      state.claimedCashbackForCustomerRequest.error = error;
    },
  },
});

export default reducer;
