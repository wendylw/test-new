/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { loadStockStatus } from './thunks';

const initialState = {
  pendingTransactionsIds: [],
  cartInventory: {
    status: '',
    error: {},
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/cart/common',
  initialState,
  reducers: {},
  extraReducers: {
    [loadStockStatus.pending.type]: state => {
      state.cartInventory.status = 'pending';
    },
    [loadStockStatus.fulfilled.type]: state => {
      state.cartInventory.status = 'fulfilled';
    },
    [loadStockStatus.rejected.type]: (state, { error }) => {
      state.cartInventory.error = error;
      state.cartInventory.status = 'rejected';
    },
  },
});

export { actions };

export default reducer;
