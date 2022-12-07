/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadStockStatus, updateCashbackApplyStatus } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';

const initialState = {
  pendingTransactionsIds: [],
  cartInventory: {
    status: '',
    error: {},
  },
  cashbackRequest: {
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/cart/common',
  initialState,
  reducers: {},
  extraReducers: {
    [loadStockStatus.pending.type]: state => {
      state.cartInventory.status = API_REQUEST_STATUS.PENDING;
    },
    [loadStockStatus.fulfilled.type]: state => {
      state.cartInventory.status = API_REQUEST_STATUS.FULFILLED;
    },
    [loadStockStatus.rejected.type]: (state, { error }) => {
      state.cartInventory.error = error;
      state.cartInventory.status = API_REQUEST_STATUS.REJECTED;
    },
    [updateCashbackApplyStatus.pending.type]: state => {
      state.cashbackRequest.error = null;
      state.cashbackRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [updateCashbackApplyStatus.fulfilled.type]: state => {
      state.cashbackRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [updateCashbackApplyStatus.rejected.type]: (state, { error }) => {
      state.cashbackRequest.error = error;
      state.cashbackRequest.status = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export { actions };

export default reducer;
