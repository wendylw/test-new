import { createSlice } from '@reduxjs/toolkit';
import { fetchRewardList, fetchRewardDetail, applyPromo, applyVoucher } from './thunks';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

const initialState = {
  loadRewardListRequest: {
    data: null,
    status: null,
    error: null,
  },
  loadRewardDetailRequest: {
    data: null,
    status: null,
    error: null,
  },
  applyPromoRequest: {
    status: null,
    error: null,
  },
  applyVoucherRequest: {
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'app/rewards',
  initialState,
  extraReducers: {
    [fetchRewardList.pending.type]: state => {
      state.loadRewardListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadRewardListRequest.error = null;
    },
    [fetchRewardList.fulfilled.type]: (state, { payload }) => {
      state.loadRewardListRequest.data = payload;
      state.loadRewardListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadRewardListRequest.error = null;
    },
    [fetchRewardList.rejected.type]: (state, { error }) => {
      state.loadRewardListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadRewardListRequest.error = error;
    },
    [fetchRewardDetail.pending.type]: state => {
      state.loadRewardDetailRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadRewardDetailRequest.error = null;
    },
    [fetchRewardDetail.fulfilled.type]: (state, { payload }) => {
      state.loadRewardDetailRequest.data = payload;
      state.loadRewardDetailRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadRewardDetailRequest.error = null;
    },
    [fetchRewardDetail.rejected.type]: (state, { error }) => {
      state.loadRewardDetailRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadRewardDetailRequest.error = error;
    },
    [applyPromo.pending.type]: state => {
      state.applyPromoRequest.status = API_REQUEST_STATUS.PENDING;
      state.applyPromoRequest.error = null;
    },
    [applyPromo.fulfilled.type]: (state, { payload }) => {
      state.applyPromoRequest.data = payload;
      state.applyPromoRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.applyPromoRequest.error = null;
    },
    [applyPromo.rejected.type]: (state, { error }) => {
      state.applyPromoRequest.status = API_REQUEST_STATUS.REJECTED;
      state.applyPromoRequest.error = error;
    },
    [applyVoucher.pending.type]: state => {
      state.applyVoucherRequest.status = API_REQUEST_STATUS.PENDING;
      state.applyVoucherRequest.error = null;
    },
    [applyVoucher.fulfilled.type]: (state, { payload }) => {
      state.applyVoucherRequest.data = payload;
      state.applyVoucherRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.applyVoucherRequest.error = null;
    },
    [applyVoucher.rejected.type]: (state, { error }) => {
      state.applyVoucherRequest.status = API_REQUEST_STATUS.REJECTED;
      state.applyVoucherRequest.error = error;
    },
  },
});

export default reducer;
