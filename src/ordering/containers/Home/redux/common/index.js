/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { showProductDetail } from './thunks';

const initialState = {
  selectedProductDetail: {
    categoryId: null,
    productId: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/home/common',
  initialState,
  reducers: {},
  extraReducers: {
    [showProductDetail.fulfilled.type]: (state, { payload }) => {
      state.selectedProductDetail.categoryId = payload.categoryId;
      state.selectedProductDetail.productId = payload.productId;
    },
  },
});

export default reducer;

export { actions };
