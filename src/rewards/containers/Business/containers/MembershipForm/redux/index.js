import { createSlice } from '@reduxjs/toolkit';
import { fetchBusinessInfo, joinNowButtonClicked } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';

const initialState = {
  isJoinNowButtonDisabled: false,
  fetchBusinessInfoRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'rewards/business/membershipForm',
  initialState,
  extraReducers: {
    [fetchBusinessInfo.pending.type]: state => {
      state.fetchBusinessInfoRequest.status = API_REQUEST_STATUS.PENDING;
      state.fetchBusinessInfoRequest.error = null;
    },
    [fetchBusinessInfo.fulfilled.type]: (state, { payload }) => {
      state.fetchBusinessInfoRequest.data = payload;
      state.fetchBusinessInfoRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [fetchBusinessInfo.rejected.type]: (state, { error }) => {
      state.fetchBusinessInfoRequest.status = API_REQUEST_STATUS.REJECTED;
      state.fetchBusinessInfoRequest.error = error;
    },
    [joinNowButtonClicked.pending.type]: state => {
      state.isJoinNowButtonDisabled = true;
    },
    [joinNowButtonClicked.fulfilled.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinNowButtonClicked.rejected.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
  },
});

export default reducer;
