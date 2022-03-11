import { createSlice } from '@reduxjs/toolkit';
import {
  loadCashbackInfo,
  createCashbackInfo,
  loadStoreIdHashCode,
  loadStoreIdTableIdHashCode,
  cancelOrder,
  updateOrderShippingType,
} from './thunks';

const initialState = {
  /* included: customerId, consumerId, status */
  cashbackInfo: {
    customerId: null,
    consumerId: null,
    status: null,
    error: null,
  },
  updateCashbackInfoStatus: null,
  storeHashCode: null,
  orderCancellationReasonAsideVisible: false,
  updateShippingTypeStatus: null, // pending || fulfilled || rejected
  updateShippingTypeError: null,
  cancelOrderStatus: null, // pending || fulfilled || rejected
  profileModalVisibility: false,
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/thankYou',
  initialState,
  reducers: {
    updateCancellationReasonVisibleState(state, action) {
      state.orderCancellationReasonAsideVisible = action.payload;
    },
    setShowProfileVisibility(state, action) {
      state.profileModalVisibility = action.payload;
    },
  },
  extraReducers: {
    [loadCashbackInfo.pending.type]: state => {
      state.updateCashbackInfoStatus = 'pending';
    },
    [loadCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = Object.assign({}, state.cashbackInfo, payload, {
        updateCashbackInfoStatus: 'fulfilled',
        createdCashbackInfo: false,
      });
    },
    [loadCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.updateCashbackInfoStatus = 'rejected';
    },
    [createCashbackInfo.pending.type]: state => {
      state.updateCashbackInfoStatus = 'pending';
    },
    [createCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = Object.assign({}, state.cashbackInfo, payload, {
        updateCashbackInfoStatus: 'fulfilled',
        createdCashbackInfo: true,
      });
    },
    [createCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.updateCashbackInfoStatus = 'rejected';
    },
    [loadStoreIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.storeHashCode = payload.redirectTo;
    },
    [loadStoreIdTableIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.storeHashCode = payload.hex;
    },
    [cancelOrder.pending.type]: state => {
      state.cancelOrderStatus = 'pending';
    },
    [cancelOrder.fulfilled.type]: state => {
      state.cancelOrderStatus = 'fulfilled';
    },
    [cancelOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.cancelOrderStatus = 'rejected';
    },
    [updateOrderShippingType.pending.type]: state => {
      state.updateShippingTypeStatus = 'pending';
    },
    [updateOrderShippingType.fulfilled.type]: state => {
      state.updateShippingTypeStatus = 'fulfilled';
    },
    [updateOrderShippingType.rejected.type]: (state, { error }) => {
      state.updateShippingTypeError = error;
      state.updateShippingTypeStatus = 'rejected';
    },
  },
});

export { actions };

export default reducer;
