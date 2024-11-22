import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { fetchMyRewardDetail } from './thunks';

const initialState = {
  loadMyRewardDetailRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/myRewardDetail',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchMyRewardDetail.pending.type]: state => {
      state.loadMyRewardDetailRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadMyRewardDetailRequest.error = null;
    },
    [fetchMyRewardDetail.fulfilled.type]: (state, { payload }) => {
      state.loadMyRewardDetailRequest.data = payload;
      state.loadMyRewardDetailRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadMyRewardDetailRequest.error = null;
    },
    [fetchMyRewardDetail.rejected.type]: (state, { error }) => {
      state.loadMyRewardDetailRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadMyRewardDetailRequest.error = error;
    },
  },
});

export default reducer;
