/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../utils/api/api-utils';

const CartItemModel = {
  id: null,
  productId: null,
  title: '',
  variationTexts: [],
  displayPrice: 0,
  originalDisplayPrice: 0,
  image: null,
  stockStatus: '',
  quantity: 0,
  quantityOnHand: 0,
};

const initialState = {
  status: 'pending',
  isFetching: false,
  items: [],
  unavailableItems: [],
  billing: {
    discount: 0,
    subtotal: 0,
    total: 0,
    tax: 0,
    totalCashback: 0,
    serviceCharge: 0,
    shippingFee: 0,
    promotion: {
      promoCode: null,
      discount: 0,
      promoType: '',
      status: '',
    },
    voucher: {
      promoCode: null,
      status: '',
      discount: 0,
      validFrom: null,
      promoType: '',
    },
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/app/cart',
  initialState,
  reducers: {},
  extraReducers: {},
});

export default reducer;
