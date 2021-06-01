import { createSlice } from '@reduxjs/toolkit';
import { loadCashbackInfo, createCashbackInfo, loadStoreIdHashCode, loadStoreIdTableIdHashCode } from './thunks';

const initialState = {
  /* included: isFetching, customerId, consumerId, status */
  cashbackInfo: {
    isFetching: false,
    customerId: null,
    consumerId: null,
    status: null,
    updateCashbackInfoStatus: null,
    createdCashbackInfo: false,
    error: null,
  },
  storeHashCode: null,
  orderCancellationReasonAsideVisible: false,
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/thankYou',
  initialState,
  reducers: {
    updateCancellationReasonVisibleState(state, action) {
      state.orderCancellationReasonAsideVisible = action.payload;
    },
  },
  extraReducers: {
    [loadCashbackInfo.pending.type]: state => {
      state.cashbackInfo.isFetching = true;
      state.cashbackInfo.updateCashbackInfoStatus = 'pending';
    },
    [loadCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = Object.assign({}, state.cashbackInfo, payload, {
        isFetching: false,
        updateCashbackInfoStatus: 'fulfilled',
        createdCashbackInfo: false,
      });
    },
    [loadCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.cashbackInfo.isFetching = false;
      state.cashbackInfo.updateCashbackInfoStatus = 'rejected';
    },
    [createCashbackInfo.pending.type]: state => {
      state.cashbackInfo.isFetching = true;
      state.cashbackInfo.updateCashbackInfoStatus = 'pending';
    },
    [createCashbackInfo.fulfilled.type]: (state, { payload }) => {
      state.cashbackInfo = Object.assign({}, state.cashbackInfo, payload, {
        isFetching: false,
        updateCashbackInfoStatus: 'fulfilled',
        createdCashbackInfo: true,
      });
    },
    [createCashbackInfo.rejected.type]: (state, { error }) => {
      state.cashbackInfo.error = error;
      state.cashbackInfo.isFetching = false;
      state.cashbackInfo.updateCashbackInfoStatus = 'rejected';
    },
    [loadStoreIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.storeHashCode = payload.redirectTo;
    },
    [loadStoreIdTableIdHashCode.fulfilled.type]: (state, { payload }) => {
      state.storeHashCode = payload.hex;
    },
  },
});

export { actions };

export default reducer;
