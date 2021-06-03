import Utils from '../../../../utils/utils';
import { createSlice } from '@reduxjs/toolkit';
import { cancelOrder, loadOrder, loadOrderStatus, updateOrderShippingType } from './thunks';

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {},
  extraReducers: {
    [cancelOrder.pending.type]: state => {
      state.cancelOrderStatus = 'pending';
    },
    [cancelOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.cancelOrderStatus = 'fulfilled';
    },
    [cancelOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.cancelOrderStatus = 'rejected';
    },
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
    [loadOrderStatus.fulfilled.type]: (state, { payload }) => {
      state.order = {
        ...state.order,
        status: payload.status,
        riderLocations: payload.riderLocations,
      };
    },
    [loadOrderStatus.rejected.type]: (state, { error }) => {
      state.error = error;
    },
    // [updateOrderShippingType.pending.type]: state => {
    //   state.updateOrderStatus = 'pending';
    // },
    // [updateOrderShippingType.fulfilled.type]: (state, { payload }) => {
    //   state.order = payload.order;
    //   state.updateOrderStatus = 'fulfilled';
    // },
    [updateOrderShippingType.rejected.type]: (state, { error }) => {
      state.error = error;
    },
  },
});

export { actions };

export default reducer;
