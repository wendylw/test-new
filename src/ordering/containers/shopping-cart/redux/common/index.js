/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadStockStatus, reloadBillingByCashback } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';

const initialState = {
  pendingTransactionsIds: [],
  cartInventory: {
    status: '',
    error: {},
  },
  reloadBillingByCashbackRequest: {
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
    [reloadBillingByCashback.pending.type]: state => {
      state.reloadBillingByCashbackRequest.error = null;
      state.reloadBillingByCashbackRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [reloadBillingByCashback.fulfilled.type]: state => {
      state.reloadBillingByCashbackRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [reloadBillingByCashback.rejected.type]: (state, { error }) => {
      state.reloadBillingByCashbackRequest.error = error;
      state.reloadBillingByCashbackRequest.status = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export { actions };

export default reducer;
