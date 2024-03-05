import { createSlice } from '@reduxjs/toolkit';
import { joinMembership, fetchMembershipsInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

const initialState = {
  joinMembershipRequest: {
    data: null,
    status: null,
    error: null,
  },
  loadMembershipRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'app/membership',
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
    [fetchMembershipsInfo.pending.type]: state => {
      state.loadMembershipRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadMembershipRequest.error = null;
    },
    [fetchMembershipsInfo.fulfilled.type]: (state, { payload }) => {
      state.loadMembershipRequest.data = payload;
      state.loadMembershipRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadMembershipRequest.error = null;
    },
    [fetchMembershipsInfo.rejected.type]: (state, { error }) => {
      state.loadMembershipRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadMembershipRequest.error = error;
    },
  },
});

export default reducer;
