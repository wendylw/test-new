/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import {
  loadOrders,
  loadOrdersStatus,
  lockOrder,
  showRedirectLoader,
  hideRedirectLoader,
  showProcessingLoader,
  hideProcessingLoader,
  reloadBillingByCashback,
} from './thunks';

const PromotionItemModel = {
  promotionId: null,
  tax: 0,
  taxCode: null,
  code: null,
  promotionCode: null,
  promotionName: null,
  status: null,
  discount: 0,
  discountType: null,
};

const appliedVoucherModel = {
  voucherId: null,
  voucherCode: null,
  value: 0,
  cost: 0,
  purchaseChannel: null,
};

const loyaltyDiscountsModel = {
  displayDiscount: 0,
  spentValue: 0,
};

const initialState = {
  requestStatus: {
    loadOrders: API_REQUEST_STATUS.FULFILLED,
    loadOrdersStatus: API_REQUEST_STATUS.FULFILLED,
    lockOrder: null,
  },

  reloadBillingByCashbackRequest: {
    status: null,
    error: null,
  },

  order: {
    orderStatus: null,
    receiptNumber: null,
    tableId: null,
    isStorePayByCashOnly: false,
    tax: 0,
    cashback: 0,
    displayPromotions: [],
    loyaltyDiscounts: [],
    appliedVoucher: null,
    total: 0,
    subtotal: 0,
    modifiedTime: null,
    serviceCharge: 0,
    serviceChargeInfo: {},
    shippingFee: 0,
    subOrders: [],
    items: [],
    applyCashback: false,
  },

  submission: {
    thankYouPageUrl: null,
  },

  error: {
    loadOrders: null,
    loadOrdersStatus: null,
    lockOrder: null,
  },

  redirectLoaderVisible: false,
  processingLoaderVisible: false,
};

export const { reducer, actions } = createSlice({
  name: 'ordering/tableSummary',
  initialState,
  reducers: {
    updateCashbackApplyStatus(state, action) {
      state.order.applyCashback = action.payload;
    },
  },
  extraReducers: {
    [loadOrders.pending.type]: state => {
      state.requestStatus.loadOrders = API_REQUEST_STATUS.PENDING;
    },
    [loadOrders.fulfilled.type]: (state, { payload }) => {
      const { displayPromotions = [], loyaltyDiscounts = [], appliedVoucher, status: orderStatus, ...others } = {
        ...state.order,
        ...payload,
      };

      state.order = {
        ...others,
        orderStatus,
        loyaltyDiscounts: (loyaltyDiscounts || []).map(item => ({ ...loyaltyDiscountsModel, ...item })),
        displayPromotions: (displayPromotions || []).map(promotion => ({ ...PromotionItemModel, ...promotion })),
        appliedVoucher: { ...appliedVoucherModel, ...appliedVoucher },
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
      state.order.orderStatus = payload.status;
      if (payload.redirectUrl) {
        state.submission.thankYouPageUrl = payload.redirectUrl;
      }
      state.requestStatus.loadOrdersStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [loadOrdersStatus.rejected.type]: (state, { error }) => {
      state.error.loadOrdersStatus = error;
      state.requestStatus.loadOrdersStatus = API_REQUEST_STATUS.REJECTED;
    },
    [lockOrder.pending.type]: state => {
      state.requestStatus.lockOrder = API_REQUEST_STATUS.PENDING;
    },
    [lockOrder.fulfilled.type]: (state, { payload }) => {
      const { redirectUrl } = payload;
      if (redirectUrl) {
        state.submission.thankYouPageUrl = redirectUrl;
      }
      state.requestStatus.lockOrder = API_REQUEST_STATUS.FULFILLED;
    },
    [lockOrder.rejected.type]: (state, { error }) => {
      state.requestStatus.lockOrder = API_REQUEST_STATUS.REJECTED;
      state.error.lockOrder = error;
    },
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
  },
});

export default reducer;
