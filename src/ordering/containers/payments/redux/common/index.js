import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import { initialize, loadBilling, loadPaymentOptions } from './thunks';

const initialState = {
  options: [],
  selectedOptionProvider: null,
  payByCashPromptDisplay: false,
  status: '',
  error: {},
  billing: {
    data: {
      receiptNumber: null,
      modifiedTime: null,
      total: null,
      subtotal: null,
      itemsQuantity: 0,
      cashback: null, // create order api needs this
    },
    status: null,
    error: null,
  },
  initPaymentRequest: {
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/payments/common',
  initialState,
  reducers: {
    updatePaymentOptionSelected: (state, { payload }) => {
      state.selectedOptionProvider = payload;
    },
    updatePayByCashPromptDisplayStatus: (state, { payload }) => {
      state.payByCashPromptDisplay = payload.status;
    },
  },
  extraReducers: {
    [loadBilling.pending]: state => {
      state.billing.status = API_REQUEST_STATUS.PENDING;
    },
    [loadBilling.fulfilled]: (state, { payload }) => {
      state.billing.status = API_REQUEST_STATUS.FULFILLED;
      state.billing.data.receiptNumber = payload.receiptNumber;
      state.billing.data.modifiedTime = payload.modifiedTime;
      state.billing.data.total = payload.total;
      state.billing.data.subtotal = payload.subtotal;
      state.billing.data.cashback = payload.cashback;
      state.billing.data.itemsQuantity = payload.itemsQuantity;
    },
    [loadBilling.rejected]: (state, { error }) => {
      state.billing.status = API_REQUEST_STATUS.REJECTED;
      state.billing.error = error;
    },
    [loadPaymentOptions.pending]: state => {
      state.status = API_REQUEST_STATUS.PENDING;
    },
    [loadPaymentOptions.fulfilled]: (state, { payload }) => {
      const { paymentOptions, selectedPaymentOption } = payload;

      state.status = API_REQUEST_STATUS.FULFILLED;
      state.options = paymentOptions;

      if (selectedPaymentOption) {
        state.selectedOptionProvider = selectedPaymentOption.paymentProvider;
      }
    },
    [loadPaymentOptions.rejected]: (state, { error }) => {
      state.status = API_REQUEST_STATUS.REJECTED;
      state.error = error;
    },
    [initialize.pending]: state => {
      state.initPaymentRequest.status = API_REQUEST_STATUS.PENDING;
      state.initPaymentRequest.error = null;
    },
    [initialize.fulfilled]: state => {
      state.initPaymentRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [initialize.rejected]: (state, { error }) => {
      state.initPaymentRequest.status = API_REQUEST_STATUS.REJECTED;
      state.initPaymentRequest.error = error;
    },
  },
});

export { actions };

export default reducer;
