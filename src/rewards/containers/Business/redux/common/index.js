import { createSlice } from '@reduxjs/toolkit';
import { joinMembership, fetchBusinessInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

const initialState = {
  joinMembershipRequest: {
    data: null,
    status: null,
    error: null,
  },
  fetchBusinessInfoRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'rewards/business/common',
  initialState,
  extraReducers: {
    [joinMembership.pending.type]: state => {
      state.joinMembershipRequest.status = API_REQUEST_STATUS.PENDING;
      state.joinMembershipRequest.error = null;
    },
    [joinMembership.fulfilled.type]: (state, { payload }) => {
      state.joinMembershipRequest.data = payload;
      state.joinMembershipRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [joinMembership.rejected.type]: (state, { error }) => {
      state.joinMembershipRequest.status = API_REQUEST_STATUS.REJECTED;
      state.joinMembershipRequest.error = error;
    },
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
  },
});

export default reducer;