import { createSlice } from '@reduxjs/toolkit';
import {
  loadCashbackInfo,
  createCashbackInfo,
  loadStoreIdHashCode,
  loadStoreIdTableIdHashCode,
  cancelOrder,
  updateOrderShippingType,
  loadFoodCourtIdHashCode,
  showProfileModal,
  hideProfileModal,
  updateRedirectFrom,
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
  cancelOrderError: null,
  profileModalVisibility: false,
  foodCourtInfo: {
    hashCode: null,
  },
  redirectFrom: null,
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
    [updateRedirectFrom.fulfilled.type]: (state, { payload }) => {
      state.redirectFrom = payload;
    },
    [loadCashbackInfo.pending.type]: state => {
      state.updateCashbackInfoStatus = 'pending';
    },
    [loadCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = {
        ...state.cashbackInfo,
        ...payload,
        updateCashbackInfoStatus: 'fulfilled',
        createdCashbackInfo: false,
      };
    },
    [loadCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.updateCashbackInfoStatus = 'rejected';
    },
    [createCashbackInfo.pending.type]: state => {
      state.updateCashbackInfoStatus = 'pending';
    },
    [createCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = {
        ...state.cashbackInfo,
        ...payload,
        updateCashbackInfoStatus: 'fulfilled',
        createdCashbackInfo: true,
      };
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
      state.cancelOrderError = null;
    },
    [cancelOrder.fulfilled.type]: state => {
      state.cancelOrderStatus = 'fulfilled';
    },
    [cancelOrder.rejected.type]: (state, { error }) => {
      state.cancelOrderError = error;
      state.cancelOrderStatus = 'rejected';
    },
    [updateOrderShippingType.pending.type]: state => {
      state.updateShippingTypeStatus = 'pending';
      state.updateShippingTypeError = null;
    },
    [updateOrderShippingType.fulfilled.type]: state => {
      state.updateShippingTypeStatus = 'fulfilled';
    },
    [updateOrderShippingType.rejected.type]: (state, { error }) => {
      state.updateShippingTypeError = error;
      state.updateShippingTypeStatus = 'rejected';
    },
    [loadFoodCourtIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.foodCourtInfo.hashCode = payload.hex;
    },
    [showProfileModal.fulfilled.type]: state => {
      state.profileModalVisibility = true;
    },
    [hideProfileModal.fulfilled.type]: state => {
      state.profileModalVisibility = false;
    },
  },
});

export { actions };

export default reducer;
