import { createSlice } from '@reduxjs/toolkit';
import {
  confirmToShareConsumerInfo,
  fetchUniquePromoList,
  fetchUniquePromoListBanners,
  fetchPointsRewardList,
  claimPointsReward,
  loadOrderRewards,
  claimOrderRewards,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  confirmSharingConsumerInfoRequest: {
    data: null,
    status: null,
    error: null,
  },
  loadUniquePromoListRequest: {
    data: [],
    status: null,
    error: null,
  },
  loadUniquePromoListBannersRequest: {
    data: [],
    status: null,
    error: null,
  },
  loadPointsRewardListRequest: {
    data: [],
    status: null,
    error: null,
  },
  claimPointsRewardRequest: {
    status: null,
    error: null,
  },
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
  name: 'rewards/business/common',
  initialState,
  reducers: {
    claimPointsRewardRequestReset: state => {
      state.claimPointsRewardRequest = initialState.claimPointsRewardRequest;
    },
  },
  extraReducers: {
    [confirmToShareConsumerInfo.pending.type]: state => {
      state.confirmSharingConsumerInfoRequest.status = API_REQUEST_STATUS.PENDING;
      state.confirmSharingConsumerInfoRequest.error = null;
    },
    [confirmToShareConsumerInfo.fulfilled.type]: (state, { payload }) => {
      state.confirmSharingConsumerInfoRequest.data = payload;
      state.confirmSharingConsumerInfoRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.confirmSharingConsumerInfoRequest.error = null;
    },
    [confirmToShareConsumerInfo.rejected.type]: (state, { error }) => {
      state.confirmSharingConsumerInfoRequest.status = API_REQUEST_STATUS.REJECTED;
      state.confirmSharingConsumerInfoRequest.error = error;
    },
    [fetchUniquePromoList.pending.type]: state => {
      state.loadUniquePromoListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadUniquePromoListRequest.error = null;
    },
    [fetchUniquePromoList.fulfilled.type]: (state, { payload }) => {
      state.loadUniquePromoListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadUniquePromoListRequest.data = payload;
      state.loadUniquePromoListRequest.error = null;
    },
    [fetchUniquePromoList.rejected.type]: (state, { error }) => {
      state.loadUniquePromoListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadUniquePromoListRequest.error = error;
    },
    [fetchUniquePromoListBanners.pending.type]: state => {
      state.loadUniquePromoListBannersRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadUniquePromoListBannersRequest.error = null;
    },
    [fetchUniquePromoListBanners.fulfilled.type]: (state, { payload }) => {
      state.loadUniquePromoListBannersRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadUniquePromoListBannersRequest.data = payload;
      state.loadUniquePromoListBannersRequest.error = null;
    },
    [fetchUniquePromoListBanners.rejected.type]: (state, { error }) => {
      state.loadUniquePromoListBannersRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadUniquePromoListBannersRequest.error = error;
    },
    [fetchPointsRewardList.pending.type]: state => {
      state.loadPointsRewardListRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadPointsRewardListRequest.error = null;
    },
    [fetchPointsRewardList.fulfilled.type]: (state, { payload }) => {
      state.loadPointsRewardListRequest.data = payload;
      state.loadPointsRewardListRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadPointsRewardListRequest.error = null;
    },
    [fetchPointsRewardList.rejected.type]: (state, { error }) => {
      state.loadPointsRewardListRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadPointsRewardListRequest.error = error;
    },
    [claimPointsReward.pending.type]: state => {
      state.claimPointsRewardRequest.status = API_REQUEST_STATUS.PENDING;
      state.claimPointsRewardRequest.error = null;
    },
    [claimPointsReward.fulfilled.type]: state => {
      state.claimPointsRewardRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.claimPointsRewardRequest.error = null;
    },
    [claimPointsReward.rejected.type]: (state, { error }) => {
      state.claimPointsRewardRequest.status = API_REQUEST_STATUS.REJECTED;
      state.claimPointsRewardRequest.error = error;
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
