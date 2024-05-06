import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchPointsRewardList, claimPointsReward, showWebProfileForm, hideWebProfileForm } from './thunks';

const initialState = {
  isProfileModalShow: false,
  loadPointsRewardListRequest: {
    data: [],
    status: null,
    error: null,
  },
  claimPointsRewardRequest: {
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/membershipDetail',
  initialState,
  reducers: {
    claimPointsRewardRequestReset: state => {
      state.claimPointsRewardRequest = initialState.claimPointsRewardRequest;
    },
  },
  extraReducers: {
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
    [showWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = true;
    },
    [hideWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = false;
    },
  },
});

export default reducer;
