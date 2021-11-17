/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import Utils from '../../../utils/utils';
import { API_REQUEST_STATUS } from '../../../utils/api/api-utils';
import {
  updateCart,
  updateCartSubmission,
  queryCartAndStatus,
  updateCartItems,
  removeCartItemsById,
  clearCart,
  submitCart,
  queryCartSubmissionStatus,
} from './thunks';

const CartSubmissionModel = {
  requestStatus: API_REQUEST_STATUS.PENDING,
  submissionId: null,
  status: null,
  receiptNumber: null,
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
  requestStatus: API_REQUEST_STATUS.PENDING,
  id: null,
  status: 0,
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
  source: Utils.orderSource(),
  submission: CartSubmissionModel,
  error: {},
};

export const { reducer, actions } = createSlice({
  name: 'ordering/app/cart',
  initialState,
  reducers: {},
  extraReducers: {
    [updateCart]: (state, { payload }) => {
      const {
        items = [],
        unavailableItems = [],
        displayPromotions: promotions = [],
        voucher,
        displayDiscount: discount,
        totalCashback: cashback,
        ...others
      } = { ...state, ...payload };

      return {
        ...others,
        discount,
        cashback,
        promotions: (promotions || []).map(promotion => ({ ...PromotionItemModel, ...promotion })),
        voucher: { ...VoucherModel, ...voucher },
        items: items.map(item => {
          const cartItem = { ...CartItemModel, ...item };

          cartItem.price = item.displayPrice;
          cartItem.originalPrice = item.originalDisplayPrice;
          cartItem.inventory = item.quantityOnHand;
          cartItem.inventoryStatus = item.stockStatus;

          return cartItem;
        }),
        unavailableItems: unavailableItems.map(unavailableItem => {
          const unavailableCartItem = { ...CartItemModel, ...unavailableItem };

          unavailableCartItem.price = unavailableItem.displayPrice;
          unavailableCartItem.originalPrice = unavailableItem.originalDisplayPrice;
          unavailableCartItem.inventory = unavailableItem.quantityOnHand;
          unavailableCartItem.inventoryStatus = unavailableItem.stockStatus;

          return unavailableCartItem;
        }),
      };
    },
    [updateCartSubmission]: (state, { payload }) => {
      state.submission = { ...state.submission, ...payload };
    },
    [queryCartAndStatus.pending.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.PENDING;
    },
    [queryCartAndStatus.fulfilled.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [queryCartAndStatus.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateCartStatus = API_REQUEST_STATUS.REJECTED;
    },
    [updateCartItems.pending.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.PENDING;
    },
    [updateCartItems.fulfilled.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [updateCartItems.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateCartStatus = API_REQUEST_STATUS.REJECTED;
    },
    [removeCartItemsById.pending.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.PENDING;
    },
    [removeCartItemsById.fulfilled.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [removeCartItemsById.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateCartStatus = API_REQUEST_STATUS.REJECTED;
    },
    [clearCart.pending.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.PENDING;
    },
    [clearCart.fulfilled.type]: state => {
      state = initialState;
      state.updateCartStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [clearCart.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateCartStatus = API_REQUEST_STATUS.REJECTED;
    },
    [submitCart.pending.type]: state => {
      state.submission.requestStatus = API_REQUEST_STATUS.PENDING;
    },
    [submitCart.fulfilled.type]: state => {
      state.submission.requestStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [submitCart.rejected.type]: (state, { error }) => {
      state.submission.error = error;
      state.submission.requestStatus = API_REQUEST_STATUS.REJECTED;
    },
    [queryCartSubmissionStatus.pending.type]: state => {
      state.submission.requestStatus = API_REQUEST_STATUS.PENDING;
    },
    [queryCartSubmissionStatus.fulfilled.type]: state => {
      state.submission.requestStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [queryCartSubmissionStatus.rejected.type]: (state, { error }) => {
      state.submission.error = error;
      state.submission.requestStatus = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
