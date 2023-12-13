import { createSlice } from '@reduxjs/toolkit';
import { joinMembership, fetchBusinessInfo, joinNowButtonClicked, fetchCustomerMembershipInfo } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';

const initialState = {
  isJoinNowButtonDisabled: false,
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
  fetchConsumerCustomerBusinessInfoRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'rewards/business/membershipForm',
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
    [joinNowButtonClicked.pending.type]: state => {
      state.isJoinNowButtonDisabled = true;
    },
    [joinNowButtonClicked.fulfilled.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [joinNowButtonClicked.rejected.type]: state => {
      state.isJoinNowButtonDisabled = false;
    },
    [fetchCustomerMembershipInfo.pending.type]: state => {
      state.fetchConsumerCustomerBusinessInfoRequest.status = API_REQUEST_STATUS.PENDING;
      state.fetchConsumerCustomerBusinessInfoRequest.error = null;
    },
    [fetchCustomerMembershipInfo.fulfilled.type]: (state, { payload }) => {
      state.fetchConsumerCustomerBusinessInfoRequest.data = payload;
      state.fetchConsumerCustomerBusinessInfoRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [fetchCustomerMembershipInfo.rejected.type]: (state, { error }) => {
      state.fetchConsumerCustomerBusinessInfoRequest.status = API_REQUEST_STATUS.REJECTED;
      state.fetchConsumerCustomerBusinessInfoRequest.error = error;
    },
  },
});

export default reducer;
