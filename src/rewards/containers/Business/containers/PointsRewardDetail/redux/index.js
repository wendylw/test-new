import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchPointsRewardDetail, showWebProfileForm, hideWebProfileForm } from './thunks';

const initialState = {
  isProfileModalShow: false,
  loadPointsRewardDetailRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/pointsRewardDetail',
  initialState,
  reducers: {},
  extraReducers: {
    [showWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = true;
    },
    [hideWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = false;
    },
    [fetchPointsRewardDetail.pending.type]: state => {
      state.loadPointsRewardDetailRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadPointsRewardDetailRequest.error = null;
    },
    [fetchPointsRewardDetail.fulfilled.type]: (state, { payload }) => {
      state.loadPointsRewardDetailRequest.data = payload;
      state.loadPointsRewardDetailRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadPointsRewardDetailRequest.error = null;
    },
    [fetchPointsRewardDetail.rejected.type]: (state, { error }) => {
      state.loadPointsRewardDetailRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadPointsRewardDetailRequest.error = error;
    },
  },
});

export default reducer;
