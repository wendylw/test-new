import { createSlice } from '@reduxjs/toolkit';
import { loadOrderRewards, claimOrderRewards } from './thunks';
import { API_REQUEST_STATUS } from '../../../utils/constants';

const initialState = {
  loadOrderRewardsRequest: {
    data: null,
    status: null,
    error: null,
  },
  claimOrderRewardsRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'app/transaction',
  initialState,
  reducers: {},
  extraReducers: {
    [loadOrderRewards.pending.type]: state => {
      state.loadOrderRewardsRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadOrderRewardsRequest.error = null;
    },
    [loadOrderRewards.fulfilled.type]: (state, { payload }) => {
      state.loadOrderRewardsRequest.data = payload;
      state.loadOrderRewardsRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadOrderRewardsRequest.error = null;
    },
    [loadOrderRewards.rejected.type]: (state, { error }) => {
      state.loadOrderRewardsRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadOrderRewardsRequest.error = error;
    },
    [claimOrderRewards.pending.type]: state => {
      state.claimOrderRewardsRequest.status = API_REQUEST_STATUS.PENDING;
      state.claimOrderRewardsRequest.error = null;
    },
    [claimOrderRewards.fulfilled.type]: (state, { payload }) => {
      state.claimOrderRewardsRequest.data = payload;
      state.claimOrderRewardsRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.claimOrderRewardsRequest.error = null;
    },
    [claimOrderRewards.rejected.type]: (state, { error }) => {
      state.claimOrderRewardsRequest.status = API_REQUEST_STATUS.REJECTED;
      state.claimOrderRewardsRequest.error = error;
    },
  },
});

export default reducer;
