import { createSlice } from '@reduxjs/toolkit';
import { joinMembership, fetchMembershipTierList } from './thunks';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

const initialState = {
  joinMembershipRequest: {
    data: null,
    status: null,
    error: null,
  },
  loadMembershipTiersRequest: {
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
    [fetchMembershipTierList.pending.type]: state => {
      state.loadMembershipTiersRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadMembershipTiersRequest.error = null;
    },
    [fetchMembershipTierList.fulfilled.type]: (state, { payload }) => {
      state.loadMembershipTiersRequest.data = payload;
      state.loadMembershipTiersRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadMembershipTiersRequest.error = null;
    },
    [fetchMembershipTierList.rejected.type]: (state, { error }) => {
      state.loadMembershipTiersRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadMembershipTiersRequest.error = error;
    },
  },
});

export default reducer;
