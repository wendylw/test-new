import Utils from '../../../../utils/utils';
import { createSlice } from '@reduxjs/toolkit';
import { loadOrder } from './thunks';

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  updateShippingTypeStatus: null, // pending || fulfilled || rejected
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {},
  extraReducers: {
    [loadOrder.pending.type]: state => {
      state.updateOrderStatus = 'pending';
    },
    [loadOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = 'fulfilled';
    },
    [loadOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = 'rejected';
    },
  },
});

export { actions };

export default reducer;
