/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import Utils from '../../../../utils/utils';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { loadCart, loadCartStatus, updateCartItems, removeCartItemsById, clearCart, submitCart } from './thunks';

const CartSubmissionModel = {
  requestStatus: {
    submitCart: API_REQUEST_STATUS.FULFILLED,
    loadCartSubmissionStatus: null,
  },
  status: null,
  receiptNumber: null,
  submissionId: Utils.getQueryString('submissionId'),
};

const CartItemModel = {
  id: null,
  productId: null,
  image: null,
  title: null,
  variationTexts: [],
  variations: [],
  price: 0,
  originalPrice: 0,
  inventory: 0,
  inventoryStatus: null,
  quantity: 0,
  isTakeaway: false,
};

const PromotionItemModel = {
  code: null,
  name: null,
  status: null,
  discount: 0,
  discountType: null,
};

const VoucherModel = {
  code: null,
  status: null,
  minimumConsumption: 0,
  validFrom: null,
  validTo: null,
  value: 0,
};

const initialState = {
  requestStatus: {
    loadCart: API_REQUEST_STATUS.FULFILLED,
    loadCartStatus: API_REQUEST_STATUS.FULFILLED,
    updateCartItems: API_REQUEST_STATUS.FULFILLED,
    removeCartItemsById: API_REQUEST_STATUS.FULFILLED,
    clearCart: API_REQUEST_STATUS.FULFILLED,
  },
  id: null,
  status: null,
  receiptNumber: null,
  version: 0,
  total: 0,
  subtotal: 0,
  shippingFee: 0,
  serviceCharge: 0,
  tax: 0,
  discount: 0,
  cashback: 0,
  count: 0,
  promotions: [],
  voucher: null,
  comments: null,
  items: [],
  unavailableItems: [],
  shippingType: Utils.getOrderTypeFromUrl(),
  source: Utils.getOrderSource(),
  submission: CartSubmissionModel,
  isPollingCart: false,
  error: {
    loadCart: null,
    loadCartStatus: null,
    updateCartItems: null,
    removeCartItemsById: null,
    clearCart: null,
    pollingCart: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/app/cart',
  initialState,
  reducers: {
    updateCart(state, { payload }) {
      const { items = [], unavailableItems = [], promotions = [], voucher, ...others } = {
        ...state,
        ...payload,
      };

      return {
        ...others,
        receiptNumber: payload.receiptNumber || null,
        promotions: (promotions || []).map(promotion => ({ ...PromotionItemModel, ...promotion })),
        voucher: { ...VoucherModel, ...voucher },
        items: items.map(item => ({ ...CartItemModel, ...item })),
        unavailableItems: unavailableItems.map(unavailableItem => ({ ...CartItemModel, ...unavailableItem })),
      };
    },
    isPollingCartUpdated(state, { payload }) {
      state.isPollingCart = payload;
    },
    resetCartSubmission(state) {
      state.submission = CartSubmissionModel;
    },
    updateCartSubmission(state, { payload }) {
      state.submission = { ...state.submission, ...payload };

      return state;
    },
    loadCartSubmissionStatusUpdated(state, { payload }) {
      const { loadCartSubmissionStatus, error } = payload || {};

      state.submission.requestStatus.loadCartSubmissionStatus = loadCartSubmissionStatus;
      state.submission.error = error;

      return state;
    },
  },
  extraReducers: {
    [loadCart.pending.type]: state => {
      state.requestStatus.loadCart = API_REQUEST_STATUS.PENDING;
    },
    [loadCart.fulfilled.type]: state => {
      state.requestStatus.loadCart = API_REQUEST_STATUS.FULFILLED;
    },
    [loadCart.rejected.type]: (state, { error }) => {
      state.error.loadCart = error;
      state.requestStatus.loadCart = API_REQUEST_STATUS.REJECTED;
    },
    [loadCartStatus.pending.type]: state => {
      state.requestStatus.loadCartStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadCartStatus.fulfilled.type]: state => {
      state.requestStatus.loadCartStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [loadCartStatus.rejected.type]: (state, { error }) => {
      state.error.loadCartStatus = error;
      state.requestStatus.loadCartStatus = API_REQUEST_STATUS.REJECTED;
    },
    [updateCartItems.pending.type]: state => {
      state.requestStatus.updateCartItems = API_REQUEST_STATUS.PENDING;
    },
    [updateCartItems.fulfilled.type]: state => {
      state.requestStatus.updateCartItems = API_REQUEST_STATUS.FULFILLED;
    },
    [updateCartItems.rejected.type]: (state, { error }) => {
      state.error.updateCartItems = error;
      state.requestStatus.updateCartItems = API_REQUEST_STATUS.REJECTED;
    },
    [removeCartItemsById.pending.type]: state => {
      state.requestStatus.removeCartItemsById = API_REQUEST_STATUS.PENDING;
    },
    [removeCartItemsById.fulfilled.type]: state => {
      state.requestStatus.removeCartItemsById = API_REQUEST_STATUS.FULFILLED;
    },
    [removeCartItemsById.rejected.type]: (state, { error }) => {
      state.error.removeCartItemsById = error;
      state.requestStatus.removeCartItemsById = API_REQUEST_STATUS.REJECTED;
    },
    [clearCart.pending.type]: state => {
      state.requestStatus.clearCart = API_REQUEST_STATUS.PENDING;
    },
    [clearCart.fulfilled.type]: state => {
      const { status, receiptNumber, version } = state;
      state = { ...initialState, status, receiptNumber, version };

      return state;
    },
    [clearCart.rejected.type]: (state, { error }) => {
      state.error.clearCart = error;
      state.requestStatus.clearCart = API_REQUEST_STATUS.REJECTED;
    },
    [submitCart.pending.type]: state => {
      state.submission.requestStatus.submitCart = API_REQUEST_STATUS.PENDING;
    },
    [submitCart.fulfilled.type]: state => {
      state.submission.requestStatus.submitCart = API_REQUEST_STATUS.FULFILLED;
    },
    [submitCart.rejected.type]: (state, { error }) => {
      state.submission.error = error;
      state.submission.requestStatus.submitCart = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
