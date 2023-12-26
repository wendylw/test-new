import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { updateSharingConsumerInfo, confirmToShareConsumerInfoRequests } from './thunks';

const initialState = {
  updateSharingConsumerInfo: {
    status: null,
    error: null,
  },
  confirmSharingConsumerInfo: {
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/seamlessLoyalty',
  initialState,
  reducers: {},
  extraReducers: {
    [updateSharingConsumerInfo.pending.type]: state => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.PENDING;
      state.updateSharingConsumerInfo.error = null;
    },
    [updateSharingConsumerInfo.fulfilled.type]: state => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.updateSharingConsumerInfo.error = null;
    },
    [updateSharingConsumerInfo.rejected.type]: (state, { error }) => {
      state.updateSharingConsumerInfo.status = API_REQUEST_STATUS.REJECTED;
      state.updateSharingConsumerInfo.error = error;
    },
    [confirmToShareConsumerInfoRequests.pending.type]: state => {
      state.confirmSharingConsumerInfo.status = API_REQUEST_STATUS.PENDING;
      state.confirmSharingConsumerInfo.error = null;
    },
    [confirmToShareConsumerInfoRequests.fulfilled.type]: state => {
      state.confirmSharingConsumerInfo.status = API_REQUEST_STATUS.FULFILLED;
      state.confirmSharingConsumerInfo.error = null;
    },
    [confirmToShareConsumerInfoRequests.rejected.type]: (state, { error }) => {
      state.confirmSharingConsumerInfo.status = API_REQUEST_STATUS.REJECTED;
      state.confirmSharingConsumerInfo.error = error;
    },
  },
});

export default reducer;
