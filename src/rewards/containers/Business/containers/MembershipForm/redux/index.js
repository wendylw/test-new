import { createSlice } from '@reduxjs/toolkit';
import {
  joinNowButtonClicked,
  showWebProfileForm,
  hideWebProfileForm,
  joinBusinessMembership,
  loadOrderRewards,
  claimOrderRewards,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';

const initialState = {
  isProfileFormVisible: false,
  isJoinNowButtonDisabled: false,
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
  name: 'rewards/business/membershipForm',
  initialState,
  extraReducers: {
    [joinNowButtonClicked.pending.type]: state => {
      state.isJoinNowButtonDisabled = true;
    },
    [joinNowButtonClicked.fulfilled.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinNowButtonClicked.rejected.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinBusinessMembership.pending.type]: state => {
      state.isJoinNowButtonDisabled = true;
    },
    [joinBusinessMembership.fulfilled.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinBusinessMembership.rejected.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [showWebProfileForm.fulfilled.type]: state => {
      state.isProfileFormVisible = true;
    },
    [hideWebProfileForm.fulfilled.type]: state => {
      state.isProfileFormVisible = false;
    },
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
