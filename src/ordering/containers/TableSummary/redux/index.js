/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/api/api-utils';
import { loadSubOrders, loadSubOrdersStatus, submitSubOrders } from './thunks';

const initialState = {
  requestStatus: {
    loadSubOrders: API_REQUEST_STATUS.FULFILLED,
    loadSubOrdersStatus: API_REQUEST_STATUS.FULFILLED,
    submitSubOrders: API_REQUEST_STATUS.FULFILLED,
  },
  status: null,
  receiptNumber: null,
  tableId: null,
  tax: 0,
  cashback: 0,
  promotions: [],
  total: 0,
  subtotal: 0,
  modifiedTime: null,
  serviceCharge: 0,
  shippingFee: 0,
  subOrders: [
    {
      submitId: null,
      submittedTime: null,
      comments: null,
    },
  ],
  items: [
    {
      title: [],
      subtotal: 0,
      variationTexts: [],
      displayPrice: 0,
      quantity: 0,
      image: null,
    },
  ],
  submission: {
    thankYouPageUrl: null,
  },
  domStates: {
    displaySubmitOrderConfirm: false,
  },
  error: {
    loadSubOrders: null,
    loadSubOrdersStatus: null,
    submitSubOrders: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/tableSummary',
  initialState,
  reducers: {
    updateSubmitOrderConfirmDisplay(state, { payload }) {
      state.domStates.displaySubmitOrderConfirm = payload;
    },
  },
  extraReducers: {
    [loadSubOrders.pending.type]: state => {
      state.requestStatus.loadSubOrders = API_REQUEST_STATUS.PENDING;
    },
    [loadSubOrders.fulfilled.type]: (state, { payload }) => {
      const { items = [], subOrders = [], promotions = [], ...others } = {
        ...state,
        ...payload,
      };

      state = {
        ...others,
        promotions: (promotions || []).map(promotion => ({ ...promotions, ...promotion })),
        items: items.map(item => ({ ...items, ...item })),
        subOrders: subOrders.map(subOrder => ({ ...subOrders, ...subOrder })),
      };
      state.requestStatus.loadSubOrders = API_REQUEST_STATUS.FULFILLED;
    },
    [loadSubOrders.rejected.type]: (state, { error }) => {
      state.error.loadSubOrders = error;
      state.requestStatus.loadSubOrders = API_REQUEST_STATUS.REJECTED;
    },

    [loadSubOrdersStatus.pending.type]: state => {
      state.requestStatus.loadSubOrdersStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadSubOrdersStatus.fulfilled.type]: (state, { payload }) => {
      state = { ...state, ...payload };
      state.requestStatus.loadSubOrdersStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [loadSubOrdersStatus.rejected.type]: (state, { error }) => {
      state.error = error.loadSubOrdersStatus;
      state.requestStatus.loadSubOrdersStatus = API_REQUEST_STATUS.REJECTED;
    },

    [submitSubOrders.pending.type]: state => {
      state.requestStatus.submitSubOrders = API_REQUEST_STATUS.PENDING;
    },
    [submitSubOrders.fulfilled.type]: (state, { payload }) => {
      const { thankYouPageUrl } = payload;

      state.submission.thankYouPageUrl = thankYouPageUrl;
      state.requestStatus.submitSubOrders = API_REQUEST_STATUS.FULFILLED;
    },
    [submitSubOrders.rejected.type]: (state, { error }) => {
      state.error = error.submitSubOrders;
      state.requestStatus.submitSubOrders = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
