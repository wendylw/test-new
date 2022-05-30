/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/api/api-utils';
import { loadOrders, loadOrdersStatus } from './thunks';

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
  },

  order: {
    orderStatus: null,
    receiptNumber: null,
    tableId: null,
    tax: 0,
    cashback: 0,
    displayPromotions: [],
    loyaltyDiscounts: [],
    total: 0,
    subtotal: 0,
    modifiedTime: null,
    serviceCharge: 0,
    serviceChargeInfo: {},
    shippingFee: 0,
    subOrders: [],
    items: [],
  },

  submission: {
    thankYouPageUrl: null,
  },

  error: {
    loadOrders: null,
    loadOrdersStatus: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/tableSummary',
  initialState,
  reducers: {},
  extraReducers: {
    [loadOrders.pending.type]: state => {
      state.requestStatus.loadOrders = API_REQUEST_STATUS.PENDING;
    },
    [loadOrders.fulfilled.type]: (state, { payload }) => {
      const { displayPromotions = [], loyaltyDiscounts = [], appliedVoucher = [], status: orderStatus, ...others } = {
        ...state.order,
        ...payload,
      };

      state.order = {
        ...others,
        orderStatus,
        loyaltyDiscounts: (loyaltyDiscounts || []).map(item => ({ ...loyaltyDiscountsModel, ...item })),
        displayPromotions: (displayPromotions || []).map(promotion => ({ ...PromotionItemModel, ...promotion })),
        appliedVoucher: (appliedVoucher || []).map(voucher => ({ ...appliedVoucherModel, ...voucher })),
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
  },
});

export default reducer;
