/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import {
  payByCoupons,
  showRedirectLoader,
  hideRedirectLoader,
  showProcessingLoader,
  hideProcessingLoader,
  reloadBillingByCashback,
} from './thunks';

const initialState = {
  reloadBillingByCashbackRequest: {
    status: null,
    error: null,
  },

  payByCouponsRequest: {
    status: null,
    error: null,
  },

  redirectLoaderVisible: false,
  processingLoaderVisible: false,
};

export const { reducer, actions } = createSlice({
  name: 'ordering/tableSummary',
  initialState,
  reducers: {},
  extraReducers: {
    [showRedirectLoader.fulfilled.type]: state => {
      state.redirectLoaderVisible = true;
    },
    [hideRedirectLoader.fulfilled.type]: state => {
      state.redirectLoaderVisible = false;
    },
    [showProcessingLoader.fulfilled.type]: state => {
      state.processingLoaderVisible = true;
    },
    [hideProcessingLoader.fulfilled.type]: state => {
      state.processingLoaderVisible = false;
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
    [payByCoupons.pending.type]: state => {
      state.payByCouponsRequest.error = null;
      state.payByCouponsRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [payByCoupons.fulfilled.type]: state => {
      state.payByCouponsRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [payByCoupons.rejected.type]: (state, { error }) => {
      state.payByCouponsRequest.error = error;
      state.payByCouponsRequest.status = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
