/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/api/api-utils';
import { loadOrders, loadOrdersStatus, submitOrders } from './thunks';

const PromotionItemModel = {
  code: null,
  name: null,
  status: null,
  discount: 0,
  discountType: null,
};

const initialState = {
  requestStatus: {
    loadOrders: API_REQUEST_STATUS.FULFILLED,
    loadOrdersStatus: API_REQUEST_STATUS.FULFILLED,
    submitOrders: API_REQUEST_STATUS.FULFILLED,
  },

  order: {
    status: null,
    receiptNumber: null,
    tableId: null,
    tax: 0,
    cashback: 0,
    displayPromotions: [],
    total: 0,
    subtotal: 0,
    modifiedTime: null,
    serviceCharge: 0,
    shippingFee: 0,
    subOrders: [],
    items: [],
  },

  submission: {
    thankYouPageUrl: null,
  },
  uiStates: {
    displaySubmitOrderConfirm: false,
  },
  error: {
    loadOrders: null,
    loadOrdersStatus: null,
    submitOrders: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/tableSummary',
  initialState,
  reducers: {
    updateSubmitOrderConfirmDisplay(state, { payload }) {
      state.uiStates.displaySubmitOrderConfirm = payload;
    },
  },
  extraReducers: {
    [loadOrders.pending.type]: state => {
      state.requestStatus.loadOrders = API_REQUEST_STATUS.PENDING;
    },
    [loadOrders.fulfilled.type]: (state, { payload }) => {
      const { displayPromotions = [], ...others } = {
        ...state,
        ...payload,
      };

      state.order = {
        ...others,
        displayPromotions: (displayPromotions || []).map(promotion => ({ ...PromotionItemModel, ...promotion })),
      };
      state.requestStatus.loadOrders = API_REQUEST_STATUS.FULFILLED;
    },
    [loadOrders.rejected.type]: (state, { error }) => {
      state.error.loadOrders = error;
      state.requestStatus.loadOrders = API_REQUEST_STATUS.REJECTED;
    },

    [loadOrdersStatus.pending.type]: state => {
      state.requestStatus.loadOrdersStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadOrdersStatus.fulfilled.type]: (state, { payload }) => {
      state.order.status = payload.status;
      state.requestStatus.loadOrdersStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [loadOrdersStatus.rejected.type]: (state, { error }) => {
      state.error.loadOrdersStatus = error;
      state.requestStatus.loadOrdersStatus = API_REQUEST_STATUS.REJECTED;
    },

    [submitOrders.pending.type]: state => {
      state.requestStatus.submitOrders = API_REQUEST_STATUS.PENDING;
    },
    [submitOrders.fulfilled.type]: state => {
      state.requestStatus.submitOrders = API_REQUEST_STATUS.FULFILLED;
    },
    [submitOrders.rejected.type]: (state, { error }) => {
      state.error.submitOrders = error;
      state.requestStatus.submitOrders = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
