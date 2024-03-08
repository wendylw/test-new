/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { applyPromo, removePromo, applyVoucherPayLater, removeVoucherPayLater } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  requestStatus: {
    applyPromo: API_REQUEST_STATUS.FULFILLED,
    removePromo: API_REQUEST_STATUS.FULFILLED,
    applyVoucherPayLater: API_REQUEST_STATUS.FULFILLED,
    removeVoucherPayLater: API_REQUEST_STATUS.FULFILLED,
  },
  appliedResult: {
    success: null,
  },
  removePromoData: {
    code: null,
  },
  error: {
    applyPromo: {},
    removePromo: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/promotion/common',
  initialState,
  reducers: {
    init() {
      return initialState;
    },
  },
  extraReducers: {
    [applyPromo.pending.type]: state => {
      state.appliedResult.success = null;
      state.requestStatus.applyPromo = API_REQUEST_STATUS.PENDING;
    },
    [applyPromo.fulfilled.type]: state => {
      state.appliedResult.success = true;
      state.requestStatus.applyPromo = API_REQUEST_STATUS.FULFILLED;
    },
    [applyPromo.rejected.type]: (state, { payload }) => {
      state.error.applyPromo.code = payload.code;
      // ExtraReducers rejected need name field and restore from string format
      state.error.applyPromo.extraInfo = payload.extra;
      state.error.applyPromo.errorMessage = payload.message;
      state.appliedResult.success = false;
      state.requestStatus.applyPromo = API_REQUEST_STATUS.REJECTED;
    },
    [removePromo.pending.type]: state => {
      state.requestStatus.removePromo = API_REQUEST_STATUS.PENDING;
    },
    [removePromo.fulfilled.type]: (state, { payload }) => {
      state.removePromoData.code = payload.code;
      state.requestStatus.removePromo = API_REQUEST_STATUS.FULFILLED;
    },
    [removePromo.rejected.type]: (state, { error }) => {
      state.error.removePromo = error;
      state.requestStatus.removePromo = API_REQUEST_STATUS.REJECTED;
    },
    [applyVoucherPayLater.pending.type]: state => {
      state.appliedResult.success = null;
      state.requestStatus.applyVoucherPayLater = API_REQUEST_STATUS.PENDING;
    },
    [applyVoucherPayLater.fulfilled.type]: state => {
      state.appliedResult.success = true;
      state.requestStatus.applyVoucherPayLater = API_REQUEST_STATUS.FULFILLED;
    },
    [applyVoucherPayLater.rejected.type]: (state, { error }) => {
      state.appliedResult.success = false;
      state.error.applyPromo.code = error.code;
      // ExtraReducers rejected need name field and restore from string format
      state.error.applyPromo.extraInfo = error.extra;
      state.error.applyPromo.errorMessage = error.message;
      state.requestStatus.applyVoucherPayLater = API_REQUEST_STATUS.REJECTED;
    },
    [removeVoucherPayLater.pending.type]: state => {
      state.requestStatus.removeVoucherPayLater = API_REQUEST_STATUS.PENDING;
    },
    [removeVoucherPayLater.fulfilled.type]: (state, { payload }) => {
      state.removePromoData.code = payload.code;
      state.requestStatus.removeVoucherPayLater = API_REQUEST_STATUS.FULFILLED;
    },
    [removeVoucherPayLater.rejected.type]: (state, { error }) => {
      state.error.removePromo = error;
      state.requestStatus.removeVoucherPayLater = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export { actions };

export default reducer;
