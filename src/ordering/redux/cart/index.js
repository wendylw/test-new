/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../utils/api/api-utils';

const CartItemModel = {
  id: null,
  productId: null,
  title: '',
  variationTexts: [],
  variations: [],
  price: 0,
  originalPrice: 0,
  image: null,
  stock: 0,
  stockStatus: null,
  quantity: 0,
};

const initialState = {
  id: null,
  requestStatus: API_REQUEST_STATUS.PENDING,
  status: 0,
  version: 0,
  items: [],
  unavailableItems: [],
};

export const { reducer, actions } = createSlice({
  name: 'ordering/app/cart',
  initialState,
  reducers: {},
  extraReducers: {},
});

export default reducer;
