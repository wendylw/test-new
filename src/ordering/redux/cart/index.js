/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import Utils from '../../../utils/utils';
import { API_REQUEST_STATUS } from '../../../utils/api/api-utils';

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
  updateCartStatus: API_REQUEST_STATUS.PENDING,
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
  shippingType: Utils.getOrderTypeFromUrl(),
  promotions: [],
  voucher: null,
  items: [],
  unavailableItems: [],
};

export const { reducer, actions } = createSlice({
  name: 'ordering/app/cart',
  initialState,
  reducers: {},
  extraReducers: {
    [loadCart.pending.type]: state => {
      state.updateCartStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadCart.fulfilled.type]: (state, { payload }) => {
      const {
        items = [],
        unavailableItems = [],
        displayPromotions: promotions = [],
        voucher,
        displayDiscount: discount,
        totalCashback: cashback,
        ...others
      } = payload;

      state = {
        ...state,
        ...others,
        discount,
        cashback,
        updateCartStatus: API_REQUEST_STATUS.FULFILLED,
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
    [loadCart.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateCartStatus = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
